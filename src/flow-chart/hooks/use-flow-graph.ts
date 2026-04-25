import { useEdgesState, useNodesState } from "@xyflow/react";
import type { Script } from "../data-model";
import {
  extractPositions,
  modelToGraph,
  type GraphOptions,
} from "../script-adapter";
import { useEffect, useEffectEvent } from "react";

export function useFlowGraph(model: Script) {
  const initial = modelToGraph(model);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const getGraphOptions = useEffectEvent(() => {
    const positions = extractPositions(nodes);
    const selected = nodes.find((n) => n.selected)?.id;

    const result: GraphOptions = {
      positions,
      selected,
    };
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
  };
}
