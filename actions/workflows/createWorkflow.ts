"use server";

import { auth } from "@clerk/nextjs/server";

import {
  createWorkflowSchema,
  createWorkflowSchemaType,
} from "@/schemas/workflows";
import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { redirect } from "next/navigation";
import { AppWindowMac } from "lucide-react";
import { AppNode } from "@/types/appnodes";
import { Edge } from "@xyflow/react";
import { CreateFlowNode } from "@/lib/workflows/createFlowNode";
import { TaskType } from "@/types/task";

export async function CreateWorkflow(form: createWorkflowSchemaType) {
  //   VERIFICA CREDENCIAIS DO USUÁRIO
  const { userId } = await auth();

  if (!userId) throw new Error("Usuário não autenticado.");

  //   VALIDA OS DADOS RECEBIDOS
  const { success, data } = createWorkflowSchema.safeParse(form);

  if (!success) throw new Error("Dados inválidos.");

  const initialFlow: { nodes: AppNode[]; edges: Edge[] } = {
    nodes: [],
    edges: [],
  };

  initialFlow.nodes.push(CreateFlowNode(TaskType.LAUNCH_BROWSER));

  //   INSERE O REGISTRO NO BANCO DE DADOS
  const result = await prisma.workflow.create({
    data: {
      userId,
      status: WorkflowStatus.DRAFT,
      definition: JSON.stringify(initialFlow),
      ...data,
    },
  });

  //   VERIFICA O RESULTADO DA INSERÇAO
  if (!result) throw new Error("Falha ao inserir novo workflow.");

  redirect(`/workflow/editor/${result.id}`);
}
