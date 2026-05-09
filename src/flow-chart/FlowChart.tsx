import {
  Background,
  BackgroundVariant,
  BezierEdge,
  Controls,
  ReactFlow,
  SmoothStepEdge,
  type EdgeComponentProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import { type Dispatch, type SetStateAction } from "react";

import "@xyflow/react/dist/style.css";
import { AutoLayoutButton } from "./components/AutoLayoutButton";
import { FlowInspector } from "./components/FlowInspector";
import { GoalNode } from "./components/GoalNode";
import { AskNode } from "./components/nodes/AskNode";
import { ExitNode } from "./components/nodes/ExitNode";
import { SayNode } from "./components/nodes/SayNode";
import { SubagentNode } from "./components/nodes/SubagentNode";
import type { Script } from "./data-model";
import { type FlowEdge, type FlowEdgeType, type FlowNode } from "./flow-model";
import { useScriptFlow } from "./hooks/use-script-flow";

export type FlowChartProps = {
  model: Script;
  onChange: Dispatch<SetStateAction<Script>>;
  className?: string;
};

export type FlowInstance = ReactFlowInstance<FlowNode, FlowEdge>;

const nodeTypes = {
  goal: GoalNode,
  say: SayNode,
  ask: AskNode,
  subagent: SubagentNode,
  exit: ExitNode,
};

const edgeTypes: Record<FlowEdgeType, React.FC<EdgeComponentProps>> = {
  default: SmoothStepEdge,
  bezier: BezierEdge,
};

export function FlowChart({ model, onChange, className }: FlowChartProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onReconnect, isValidConnection } =
    useScriptFlow(model, onChange);

  return (
    <ReactFlow<FlowNode, FlowEdge>
      className={className}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onReconnect={onReconnect}
      isValidConnection={isValidConnection}
      defaultEdgeOptions={{
        animated: false,
        type: "default",
        className: "[&_path]:opacity-50",
      }}
      proOptions={{ hideAttribution: true }}
      minZoom={0.3}
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
