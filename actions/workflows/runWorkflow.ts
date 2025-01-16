"use server";

import prisma from "@/lib/prisma";
import { FlowToExecutionPlan } from "@/lib/workflows/executionPlan";
import { TaskRegistry } from "@/lib/workflows/task/registry";
import {
  ExecutionPhaseStatus,
  WorkflowExecutionPlan,
  WorkflowExecutionStatus,
  WorkflowExecutionTrigger,
} from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { exec } from "child_process";
import { redirect } from "next/navigation";
import { number } from "zod";

export async function RunWorkflow(form: {
  workflowId: string;
  flowDefinition?: string;
}) {
  // VERIFICA CREDENCIAIS DO USUÁRIO
  const { userId } = await auth();
  if (!userId) throw new Error("Usuário não autorizado.");

  // CARREGA OS DADOS DO WORKFLOW
  const { workflowId, flowDefinition } = form;
  if (!workflowId) throw new Error("WorkflowId é requerido.");

  const workflow = await prisma.workflow.findUnique({
    where: {
      userId,
      id: workflowId,
    },
  });

  if (!workflow) throw new Error("Workflow não encontrado.");

  if (!flowDefinition)
    throw new Error("As definições do fluxo não estão definidas.");
  const flow = JSON.parse(flowDefinition);
  const result = FlowToExecutionPlan(flow.nodes, flow.edges);
  if (result.error) throw new Error("As definições do fluxo não são válidas.");

  if (!result.executionPlan)
    throw new Error("O plano de execução não foi gerado.");

  const executionPlan: WorkflowExecutionPlan = result.executionPlan;

  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      userId,
      status: WorkflowExecutionStatus.PENDING,
      startedAt: new Date(),
      trigger: WorkflowExecutionTrigger.MANUAL,
      phases: {
        create: executionPlan.flatMap((phase) => {
          return phase.nodes.flatMap((node) => {
            return {
              userId,
              status: ExecutionPhaseStatus.CREATED,
              number: phase.phase,
              node: JSON.stringify(node),
              name: TaskRegistry[node.data.type].label,
            };
          });
        }),
      },
    },
    select: {
      id: true,
      phases: true,
    },
  });

  if (!execution) throw new Error("O workflow de execução não foi criado.");

  redirect(`/workflow/runs/${workflowId}/${execution.id}`);
}
