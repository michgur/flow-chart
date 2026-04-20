import { useCallback, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  MiniMap,
  ReactFlow,
  type ReactFlowInstance,
  type OnBeforeDelete,
  type OnConnect,
  type OnEdgesChange,
  type OnEdgesDelete,
  type OnNodesChange,
} from "@xyflow/react";
import type { FlowEdge, FlowNode } from "./adapter";
import "@xyflow/react/dist/style.css";
import { PaintBrushBroadIcon } from "@phosphor-icons/react/dist/ssr";

type FlowCanvasProps = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange<FlowEdge>;
  onConnect: OnConnect;
  onEdgesDelete: OnEdgesDelete<FlowEdge>;
  onAutoLayout: () => void;
};

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onEdgesDelete,
  onAutoLayout,
}: FlowCanvasProps) {
  const onBeforeDelete = useCallback<OnBeforeDelete<FlowNode, FlowEdge>>(
    async ({ edges }) => {
      return { nodes: [], edges };
    },
    [],
  );
  const flowRef = useRef<ReactFlowInstance<FlowNode, FlowEdge> | null>(null);
  const hasInitializedRef = useRef(false);

  const fitToView = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!flowRef.current) {
          return;
        }

        void flowRef.current.fitView({ padding: 0.2 });
      });
    });
  }, []);

  const runAutoLayout = useCallback(() => {
    onAutoLayout();
    fitToView();
  }, [fitToView, onAutoLayout]);

  const onInit = useCallback(
    (instance: ReactFlowInstance<FlowNode, FlowEdge>) => {
      flowRef.current = instance;

      if (hasInitializedRef.current) {
        return;
      }

      hasInitializedRef.current = true;
      runAutoLayout();
    },
    [runAutoLayout],
  );

  return (
    <ReactFlow<FlowNode, FlowEdge>
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgesDelete={onEdgesDelete}
      onBeforeDelete={onBeforeDelete}
      onInit={onInit}
      defaultEdgeOptions={{ animated: true }}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} />
      <MiniMap />
      <Controls>
        <ControlButton onClick={runAutoLayout} title="Auto tidy layout">
          <PaintBrushBroadIcon weight="bold" />
        </ControlButton>
      </Controls>
    </ReactFlow>
  );
}
