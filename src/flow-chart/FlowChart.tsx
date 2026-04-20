import { useCallback, useEffect, useRef } from "react";
import { useEdgesState, useNodesState, type Connection } from "@xyflow/react";
import type { Script } from "../data-model";
import {
  addTransitionFromConnection,
  buildFlowFromScript,
  extractPositions,
  removeTransitionsByEdgeIds,
  type FlowEdge,
  type FlowNode,
} from "./adapter";
import { FlowCanvas } from "./FlowCanvas";
import { layoutNodes } from "./layout";

export type FlowChartProps = {
  model: Script;
  onModelChange: (nextModel: Script) => void;
};

export function FlowChart({ model, onModelChange }: FlowChartProps) {
  const initialGraphRef = useRef(buildFlowFromScript(model, {}));
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialGraphRef.current.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(initialGraphRef.current.edges);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const hasSyncedModelRef = useRef(false);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    if (!hasSyncedModelRef.current) {
      hasSyncedModelRef.current = true;
      return;
    }

    const positions = extractPositions(nodesRef.current);
    const nextGraph = buildFlowFromScript(model, positions);

    setNodes(nextGraph.nodes);
    setEdges(nextGraph.edges);
  }, [model, setEdges, setNodes]);

  const onAutoLayout = useCallback(() => {
    setNodes((currentNodes) => layoutNodes(currentNodes, edgesRef.current));
  }, [setNodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const nextModel = addTransitionFromConnection(model, connection);

      if (nextModel !== model) {
        onModelChange(nextModel);
      }
    },
    [model, onModelChange],
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: FlowEdge[]) => {
      const nextModel = removeTransitionsByEdgeIds(
        model,
        deletedEdges.map((edge) => edge.id),
      );

      if (nextModel !== model) {
        onModelChange(nextModel);
      }
    },
    [model, onModelChange],
  );

  return (
    <FlowCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgesDelete={onEdgesDelete}
      onAutoLayout={onAutoLayout}
    />
  );
}
