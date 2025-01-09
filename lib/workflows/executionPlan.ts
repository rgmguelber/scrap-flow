import { AppNode } from "@/types/appnodes";
import {
  WorkflowExecutionPlan,
  WorkflowExecutionPlanPhase,
} from "@/types/workflow";
import { TaskRegistry } from "./task/registry";
import { Edge, getIncomers } from "@xyflow/react";
import { icons } from "lucide-react";
import App from "next/app";

type FlowToExecutionPlanType = {
  executionPlan?: WorkflowExecutionPlan;
};

export function FlowToExecutionPlan(
  nodes: AppNode[],
  edges: Edge[]
): FlowToExecutionPlanType {
  // ENCONTRA O ENTRYPOINT E O SELECIONA PARA SER O PRIMEIRO
  // NODE DO PLANO DE EXECUÇÃO
  const entryPoint = nodes.find(
    (node) => TaskRegistry[node.data.type].isEntryPoint
  );

  if (!entryPoint)
    // TODO: TRATAR ESTE ERRO
    throw new Error("Handle this error");

  const planned = new Set<string>();
  const executionPlan: WorkflowExecutionPlan = [
    {
      phase: 1,
      nodes: [entryPoint],
    },
  ];

  // FAZ A VARREDURA DO VETOR DE NÓS PARA MONTAGEM DO PLANO DE EXECUÇÃO
  for (
    let phase = 2;
    phase <= nodes.length || planned.size < nodes.length;
    phase++
  ) {
    const nextPhase: WorkflowExecutionPlanPhase = { phase, nodes: [] };

    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) continue;

      const invalidInputs = getInvalidInputs(currentNode, edges, planned);

      if (invalidInputs.length > 0) {
        const incomers = getIncomers(currentNode, nodes, edges);

        // VERIFICAR SE TODOS OS NÓS POSSUEM OS REQUISITOS ATENDIDOS
        if (incomers.every((incomer) => planned.has(incomer.id))) {
          console.error("invalid inputs", currentNode.id, invalidInputs);
          throw new Error("Tratar erro 01");
        } else {
          continue;
        }
      }

      nextPhase.nodes.push(currentNode);
      planned.add(currentNode.id);
    }
  }

  return { executionPlan };
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
  const invalidInputs = [];

  const inputs = TaskRegistry[node.data.type].inputs;
  for (const input of inputs) {
    const inputValue = node.data.inputs[input.name];
    const inputValueProvided = inputValue?.length > 0;

    // VERIFICA SE O REQUISITO FOI PREENCHIDO PELO USUÁRIO
    if (inputValueProvided) continue;

    // CASO NÃO TENHA SIDO PREENCHIDO VERIFICA SE HÁ UM OUTPUT
    // LIGADO A ESTE INPUT
    const incomingEdges = edges.filter((edge) => edge.target === node.id);
    const inputLinkedToOutput = incomingEdges.find(
      (edge) => edge.targetHandle === input.name
    );

    const requiredInputProvidedByVisitedOutput =
      input.required &&
      inputLinkedToOutput &&
      planned.has(inputLinkedToOutput.source);

    if (requiredInputProvidedByVisitedOutput) {
      continue;
    } else if (!input.required) {
      if (!inputLinkedToOutput) continue;

      if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source))
        continue;
    }

    invalidInputs.push(input.name);
  }

  return invalidInputs;
}
