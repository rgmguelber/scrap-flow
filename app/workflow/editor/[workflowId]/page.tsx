import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

import Editor from "../../_components/Editor";

async function Page({ params }: { params: Promise<{ workflowId: string }> }) {
  const workflowId = (await params).workflowId;
  const { userId } = await auth();

  if (!userId) return <div>Não autorizado!</div>;

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId, userId },
  });

  if (!workflow) return <div>Workflow não encontrado.</div>;

  return <Editor workflow={workflow} />;
}

export default Page;
