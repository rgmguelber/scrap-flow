import { memo } from "react";

import { NodeProps } from "@xyflow/react";
import NodeCard from "./NodeCard";
import NodeHeader from "./NodeHeader";
import { AppNodeData } from "@/types/appnodes";
import { TaskRegistry } from "@/lib/workflows/task/registry";
import { NodeInputs, NodeInput } from "./NodeInputs";
import { NodeOutput, NodeOutputs } from "./NodeOutputs";

const NodeComponent = memo((props: NodeProps) => {
  const nodeData = props.data as AppNodeData;
  const task = TaskRegistry[nodeData.type];

  return (
    <NodeCard nodeId={props.id} isSelected={props.selected as boolean}>
      <NodeHeader taskType={nodeData.type} />

      <NodeInputs>
        {task.inputs.map((input, index) => (
          <NodeInput key={input.name + index} input={input} nodeId={props.id} />
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
