import { revalidatePath } from "next/cache";
import "server-only";
import prisma from "../prisma";
import { exec } from "child_process";
import {
  ExecutionPhaseStatus,
  WorkflowExecutionStatus,
} from "@/types/workflow";
import { waitFor } from "../helpers/waitFor";
import { ExecutionPhase } from "@prisma/client";
import { AppNode } from "@/types/appnodes";
import { TaskRegistry } from "./task/registry";
import App from "next/app";
import { TaskParamType, TaskType } from "@/types/task";
import { ExecutorRegistry } from "./executor/registry";
import { Environment, ExecutionEnvironment } from "@/types/executor";
import { Browser, Page } from "puppeteer";
import { Edge } from "@xyflow/react";
import { Log, LogCollector } from "@/types/log";
import { createLogCollector } from "../log";

export async function ExecuteWorkflow(executionId: string) {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
    include: { workflow: true, phases: true },
  });

  if (!execution) throw new Error("Execução não encontrada.");

  // PEGA OS EDGES
  const edges = JSON.parse(execution.definition).edges as Edge[];

  // DEFINE AS CONFIGURAÇÕES DO AMBIENTE DE EXECUÇÃO
  const environment: Environment = { phases: {} };

  // INICIALIZA A EXECUÇÃO DO WORKFLOW
  await initializeWorkflowExecution(executionId, execution.workflowId);
  await initializePhaseStatuses(execution);

  // INICIALIZA OS STATUS DAS FASES
  const creditsConsumed = 0;
  let executionFailed = false;
  for (const phase of execution.phases) {
    // EXECUTA A FASE
    const phaseExecution = await executeWorkflowPhase(
      phase,
      environment,
      edges
    );

    if (!phaseExecution.success) {
      executionFailed = true;
      break;
    }
  }

  // FINALIZA A EXECUÇÃO
  await finalizeWorkflowExecution(
    executionId,
    execution.workflowId,
    executionFailed,
    creditsConsumed
  );

  // LIMPA O AMBIENTE DE EXECUÇÃO
  await cleanupEnvironment(environment);

  revalidatePath(`/workflow/runs`);
}

async function initializeWorkflowExecution(
  executionId: string,
  workflowId: string
) {
  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      startedAt: new Date(),
      status: WorkflowExecutionStatus.RUNNING,
    },
  });

  await prisma.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: WorkflowExecutionStatus.RUNNING,
      lastRunId: executionId,
    },
  });
}

async function initializePhaseStatuses(execution: any) {
  await prisma.executionPhase.updateMany({
    where: {
      id: {
        in: execution.phases.map((phase: any) => phase.id),
      },
    },
    data: {
      status: ExecutionPhaseStatus.PENDING,
    },
  });
}

async function finalizeWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number
) {
  const finalStatus = executionFailed
    ? WorkflowExecutionStatus.FAILED
    : WorkflowExecutionStatus.COMPLETED;

  await prisma.workflowExecution.update({
    where: {
      id: executionId,
    },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      creditsConsumed,
    },
  });

  await prisma.workflow
    .update({
      where: {
        id: workflowId,
        lastRunId: executionId,
      },
      data: {
        lastRunStatus: finalStatus,
      },
    })
    .catch(() => {
      // Iremos ignorar o erro, pois outros gatilhos para este workflow serão disparados
      // e atualizará estes campos.
    });
}

async function executeWorkflowPhase(
  phase: ExecutionPhase,
  environment: Environment,
  edges: Edge[]
) {
  const logCollector = createLogCollector();
  const startedAt = new Date();
  const node = JSON.parse(phase.node) as AppNode;

  setupEnvironmentForPhase(node, environment, edges);

  // Atualizada o status da fase
  await prisma.executionPhase.update({
    where: {
      id: phase.id,
    },
    data: {
      status: ExecutionPhaseStatus.RUNNING,
      startedAt,
      inputs: JSON.stringify(environment.phases[node.id].inputs),
    },
  });

  const creditsRequired = TaskRegistry[node.data.type].credits;

  const success = await executePhase(phase, node, environment, logCollector);

  const outputs = environment.phases[node.id].outputs;

  await finalizePhase(phase.id, success, outputs, logCollector);
  return { success };
}

async function finalizePhase(
  phaseId: string,
  success: boolean,
  outputs: any,
  logCollector: LogCollector
) {
  const finalStatus = success
    ? ExecutionPhaseStatus.COMPLETED
    : ExecutionPhaseStatus.FAILED;

  await prisma.executionPhase.update({
    where: {
      id: phaseId,
    },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      outputs: JSON.stringify(outputs),
      logs: {
        createMany: {
          data: logCollector.getAll().map((log) => ({
            message: log.message,
            timestamp: log.timestamp,
            logLevel: log.level,
          })),
        },
      },
    },
  });
}

async function executePhase(
  phase: ExecutionPhase,
  node: AppNode,
  environment: Environment,
  logCollector: LogCollector
): Promise<boolean> {
  const runFn = ExecutorRegistry[node.data.type];

  if (!runFn) return false;

  const executionEnvironment: ExecutionEnvironment<any> =
    createExecutionEnvironment(node, environment, logCollector);

  return await runFn(executionEnvironment);
}

async function setupEnvironmentForPhase(
  node: AppNode,
  enviroment: Environment,
  edges: Edge[]
) {
  enviroment.phases[node.id] = { inputs: {}, outputs: {} };

  const inputs = TaskRegistry[node.data.type].inputs;

  for (const input of inputs) {
    if (input.type === TaskParamType.BROWSER_INSTANCE) continue;

    const inputValue = node.data.inputs[input.name];

    if (inputValue) {
      enviroment.phases[node.id].inputs[input.name] = inputValue;
      continue;
    }

    // Leitura de parametros de outro nós precedente
    const connectedEdge = edges.find(
      (edge) => edge.target === node.id && edge.targetHandle === input.name
    );
    if (!connectedEdge) {
      console.error("Perda do input no edge.");
      return false;
    }

    const outputValue =
      enviroment.phases[connectedEdge.source].outputs[
        connectedEdge.sourceHandle!
      ];

    enviroment.phases[node.id].inputs[input.name] = outputValue;
  }
}

function createExecutionEnvironment(
  node: AppNode,
  environment: Environment,
  LogCollector: LogCollector
): ExecutionEnvironment<any> {
  return {
    getInput: (name: string) => environment.phases[node.id]?.inputs[name],

    setOutputs: (name: string, value: string) => {
      environment.phases[node.id].outputs[name] = value;
    },

    getBrowser: () => environment.browser,
    setBrowser: (browser: Browser) => (environment.browser = browser),
    getPage: () => environment.page,
    setPage: (page: Page) => (environment.page = page),

    log: LogCollector,
  };
}

async function cleanupEnvironment(enviroment: Environment) {
  if (enviroment.browser)
    await enviroment.browser
      .close()
      .catch((err) =>
        console.error("Não foi possíve fechar o browser por esta razão: ", err)
      );
}
