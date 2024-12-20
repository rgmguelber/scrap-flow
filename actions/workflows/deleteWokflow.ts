"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DeleteWorkflow(id: string) {
  //   VERIFICA CREDENCIAIS DO USUÁRIO
  const { userId } = await auth();

  if (!userId) throw new Error("Usuário não autenticado.");

  //   INSERE O REGISTRO NO BANCO DE DADOS
  await prisma.workflow.delete({
    where: {
      id,
      userId,
    },
  });

  revalidatePath("/workflows");
}
