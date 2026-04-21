import { useEdgesState, useNodesState } from "@xyflow/react";
import type { Script } from "../data-model";
import { extractPositions, modelToGraph, type GraphOptions } from "../adapter";
import { useCallback, useEffect, useEffectEvent, useRef } from "react";

export function useFlowGraph(model: Script) {
  const initial = modelToGraph(model);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const pendingRenames = useRef<Record<string, string>>({});
  const onNodeRename = useCallback((oldId: string, newId: string) => {
    pendingRenames.current[oldId] = newId;
  }, []);

  const getGraphOptions = useEffectEvent(() => {
    const positions = extractPositions(nodes);
    Object.entries(pendingRenames.current).forEach(([oldId, newId]) => {
      positions[newId] = positions[oldId];
    });
    const selected = nodes.find((n) => n.selected)?.id;

    const result: GraphOptions = {
      positions,
      selected: selected && pendingRenames.current[selected],
    };

    pendingRenames.current = {};
    return result;
  });

  useEffect(() => {
    const { nodes, edges } = modelToGraph(model, getGraphOptions());
    setNodes(nodes);
    setEdges(edges);
  }, [model, setNodes, setEdges]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    onNodeRename,
  };
}
