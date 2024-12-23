"use server";

import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function UpdateWorkflow({
  id,
  definition,
}: {
  id: string;
  definition: string;
}) {
  //   VERIFICA CREDENCIAIS DO USUÁRIO
  const { userId } = await auth();

  if (!userId) throw new Error("Usuário não autenticado.");

  //   ATUALIZA O REGISTRO NO BANCO DE DADOS
  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
      userId,
    },
  });

  //   VERIFICA SE O WORKFLOW FOI ENCONTRADO PARA ATUALIZAÇÃO
  if (!workflow) throw new Error("Workflow não encontrado.");

  if (workflow.status !== WorkflowStatus.DRAFT)
    throw new Error("Workflow não é um rascunho.");

  await prisma.workflow.update({
    data: {
      definition,
    },
    where: {
      id,
      userId,
    },
  });

  revalidatePath("/workflows");
}
