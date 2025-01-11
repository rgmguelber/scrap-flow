import { cn } from "@/lib/utils";
import { TaskParam } from "@/types/task";
import { Handle, Position, useEdges } from "@xyflow/react";
import React from "react";
import NodeParamField from "./NodeParamField";
import { ColorForHandle } from "./common";
import useFlowValidation from "@/components/hooks/useFlowValidation";

export function NodeInputs({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeInput({
  input,
  nodeId,
}: {
  input: TaskParam;
  nodeId: string;
}) {
  const { invalidInputs } = useFlowValidation();

  const edges = useEdges();

  const isConnected = edges.some(
    (edge) => edge.target === nodeId && edge.targetHandle === input.name
  );

  const node = invalidInputs.find((node) => node.nodeId === nodeId);
  const inputTest = node?.inputs.find((invalid) => invalid === input.name);

  console.log(inputTest);

  const hasErrors = invalidInputs
    .find((node) => node.nodeId === nodeId)
    ?.inputs.find((invalid) => invalid === input.name);

  console.log("inputName", input.name, "hasError", hasErrors);

  return (
    <div
      className={cn(
        "flex justify-start relative p-3 bg-secundary w-full",
        hasErrors && "bg-destructive/30"
      )}
    >
      {"hasErrros: " + hasErrors}
      <NodeParamField param={input} nodeId={nodeId} disabled={isConnected} />

      {!input.hideHandle && (
        <Handle
          id={input.name}
          isConnectable={!isConnected}
          position={Position.Left}
          type="target"
          className={cn(
            "!bg-muted-foreground !border-2 !border-background !-left-2 !w-4 !h-4",
            ColorForHandle[input.type]
          )}
        />
      )}
    </div>
  );
}
