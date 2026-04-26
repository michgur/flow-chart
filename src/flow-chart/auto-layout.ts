import { Position } from "@xyflow/react";
import * as dagre from "dagre";

import type { FlowEdge, FlowNode } from "./flow-model";

const LAYOUT_NODE_WIDTH = 220;
const LAYOUT_NODE_HEIGHT = 56;

export function layoutNodes(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  if (nodes.length === 0) {
    return nodes;
  }

  const graph = new dagre.graphlib.Graph();

  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "TB",
    ranksep: 96,
    nodesep: 60,
    marginx: 24,
    marginy: 24,
  });

  for (const node of nodes) {
    graph.setNode(node.id, {
      width: LAYOUT_NODE_WIDTH,
      height: LAYOUT_NODE_HEIGHT,
    });
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

    return {
      ...node,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      position: {
        x: layoutedNode.x - LAYOUT_NODE_WIDTH / 2,
        y: layoutedNode.y - LAYOUT_NODE_HEIGHT / 2,
      },
    };
  });
}
