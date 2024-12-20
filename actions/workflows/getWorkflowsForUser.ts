"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GetWorkflowsForUser() {
  // Verifica as credenciais do usuário
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Usuário não autenticado.");
  }

  return prisma.workflow.findMany({
    where: {
      userId,
    },
  });
}
