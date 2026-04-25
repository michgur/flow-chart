import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { Script } from "./data-model";
import { type FlowEdge, type FlowNode } from "./script-adapter";
import { layoutNodes } from "./auto-layout";
import { FlowInspector } from "./ui/FlowInspector";
import { GoalNode } from "./ui/GoalNode";
import "@xyflow/react/dist/style.css";
import { PaintBrushBroadIcon } from "@phosphor-icons/react/dist/ssr";
import { useFlowGraph } from "./hooks/use-flow-graph";
import { useFlowSelection } from "./hooks/use-flow-selection";
import { useFlowScriptActions } from "./hooks/use-flow-script-actions";
import { ScriptStoreProvider, useCreateScriptStore } from "./hooks/use-script";

export type FlowChartProps = {
  model: Script;
  onChange: Dispatch<SetStateAction<Script>>;
  className?: string;
};

export type FlowInstance = ReactFlowInstance<FlowNode, FlowEdge>;

export function FlowChart({ model, onChange, className }: FlowChartProps) {
  const flowRef = useRef<FlowInstance>(null);
  const { setNodes, nodes, edges, onNodesChange, onEdgesChange } =
    useFlowGraph(model);
  const { selection, setSelection, onSelectionChange } =
    useFlowSelection(flowRef);
  const { onDelete, onConnect, onReconnect, isValidConnection } =
    useFlowScriptActions(model, onChange);

  const store = useCreateScriptStore(model, onChange, setSelection);

  const onAutoLayout = useCallback(() => {
    setNodes((nodes) => layoutNodes(nodes, edges));
    void flowRef.current?.fitView({ padding: 0.2, duration: 300 });
  }, [setNodes, edges]);

  const onInit = useCallback((instance: FlowInstance) => {
    flowRef.current = instance;
    onAutoLayout();
  }, []);

  const showInspector =
    selection?.kind === "goal" || selection?.kind === "transition";

  return (
    <ScriptStoreProvider value={store}>
      <ReactFlow<FlowNode, FlowEdge>
        className={className}
        nodes={nodes}
        edges={edges}
        nodeTypes={{ goal: GoalNode }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDelete={onDelete}
        onReconnect={onReconnect}
        onSelectionChange={onSelectionChange}
        onInit={onInit}
        defaultEdgeOptions={{ animated: true }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls>
          <ControlButton onClick={onAutoLayout} title="Auto tidy layout">
            <PaintBrushBroadIcon weight="bold" />
          </ControlButton>
        </Controls>
        {showInspector ? <FlowInspector selection={selection} /> : null}
      </ReactFlow>
    </ScriptStoreProvider>
  );
}
