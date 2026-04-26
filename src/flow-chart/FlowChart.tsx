import { type Dispatch, type SetStateAction } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Script } from "./data-model";
import { type FlowEdge, type FlowNode } from "./flow-model";
import { GoalNode } from "./ui/GoalNode";
import { FlowInspector } from "./ui/FlowInspector";
import { useScriptFlow } from "./hooks/use-script-flow";
import { AutoLayoutButton } from "./ui/AutoLayoutButton";
import { SayNode } from "./ui/nodes/SayNode";

export type FlowChartProps = {
  model: Script;
  onChange: Dispatch<SetStateAction<Script>>;
  className?: string;
};

export type FlowInstance = ReactFlowInstance<FlowNode, FlowEdge>;

const nodeTypes = { goal: GoalNode, say: SayNode };

export function FlowChart({ model, onChange, className }: FlowChartProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    isValidConnection,
  } = useScriptFlow(model, onChange);

  return (
    <ReactFlow<FlowNode, FlowEdge>
      className={className}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onReconnect={onReconnect}
      isValidConnection={isValidConnection}
      defaultEdgeOptions={{ animated: true }}
      proOptions={{ hideAttribution: true }}
      fitView
    >
      <Background variant={BackgroundVariant.Dots} />
      <Controls>
        <AutoLayoutButton />
      </Controls>
      <FlowInspector />
    </ReactFlow>
  );
}
