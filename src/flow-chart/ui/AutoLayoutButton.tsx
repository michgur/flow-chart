import { PaintBrushBroadIcon } from "@phosphor-icons/react/dist/ssr";
import { ControlButton, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

import { layoutNodes } from "../auto-layout";
import type { FlowEdge, FlowNode } from "../flow-model";

export function AutoLayoutButton() {
  const { setNodes, getEdges, fitView } = useReactFlow<FlowNode, FlowEdge>();

  const onClick = useCallback(() => {
    const edges = getEdges();
    setNodes((nodes) => layoutNodes(nodes, edges));
    void fitView({ padding: 0.2, duration: 300 });
  }, [setNodes, getEdges, fitView]);

  return (
    <ControlButton onClick={onClick} title="Auto tidy layout">
      <PaintBrushBroadIcon weight="bold" />
    </ControlButton>
  );
}
