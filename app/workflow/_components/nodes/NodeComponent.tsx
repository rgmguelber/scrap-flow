import { memo } from "react";

import { NodeProps } from "@xyflow/react";
import NodeCard from "./NodeCard";
import NodeHeader from "./NodeHeader";
import { AppNodeData } from "@/types/appnodes";
import { TaskRegistry } from "@/lib/workflows/task/registry";
import { NodeInputs, NodeInput } from "./NodeInputs";
import { NodeOutput, NodeOutputs } from "./NodeOutputs";
import { TaskParam } from "@/types/task";
import { Badge } from "@/components/ui/badge";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

const NodeComponent = memo((props: NodeProps) => {
  const nodeData = props.data as AppNodeData;
  const task = TaskRegistry[nodeData.type];

  return (
    <NodeCard nodeId={props.id} isSelected={props.selected as boolean}>
      {DEV_MODE && <Badge>{props.id}</Badge>}
      <NodeHeader taskType={nodeData.type} nodeId={props.id} />

      <NodeInputs>
        {task.inputs.map((input, index) => (
          <NodeInput
            key={input.name + index}
            input={input as TaskParam}
            nodeId={props.id}
          />
        ))}
      </NodeInputs>

      <NodeOutputs>
        {task.outputs.map((output, index) => (
          <NodeOutput key={output.name + index} output={output} />
        ))}
      </NodeOutputs>
    </NodeCard>
  );
});

export default NodeComponent;
NodeComponent.displayName = "NodeComponent";
