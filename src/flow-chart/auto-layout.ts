import { Position } from "@xyflow/react";
import * as dagre from "dagre";

import type { FlowEdge, FlowNode } from "./flow-model";

function nodeSize(node: FlowNode) {
  const width = node.type === "exit" ? 16 : 220;
  const height = node.type === "exit" ? 16 : 56;
  return {
    width: node.measured?.width ?? width,
    height: node.measured?.height ?? height,
  };
}

export function layoutNodes(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  if (nodes.length === 0) {
    return nodes;
  }

  const graph = new dagre.graphlib.Graph();

  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "TB",
    ranksep: 64,
    nodesep: 32,
    marginx: 24,
    marginy: 24,
  });

  for (const node of nodes) {
    graph.setNode(node.id, nodeSize(node));
  }

  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  return nodes.map((node) => {
    const layoutedNode = graph.node(node.id);

    if (!layoutedNode) {
      return node;
    }

    const size = nodeSize(node);
    return {
      ...node,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      position: {
        x: layoutedNode.x - size.width / 2,
        y: layoutedNode.y - size.height / 2,
      },
    };
  });
}
