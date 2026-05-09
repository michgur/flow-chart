import * as dagre from "dagre";

import {
  INTRO_NODE_ID,
  SCHEDULE_CALLBACK_NODE_ID,
  type FlowEdge,
  type FlowNode,
} from "./flow-model";

function nodeSize(node: FlowNode) {
  const width = node.type === "exit" ? 16 : 256;
  const height = node.type === "exit" ? 16 : 128;
  return {
    width: node.measured?.width ?? width,
    height: node.measured?.height ?? height,
  };
}

export function layoutNodes(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure the layout for a top-to-bottom, grid-like structure
  dagreGraph.setGraph({
    rankdir: "TB", // Top to Bottom layout
    align: "UL", // Up-Left alignment enforces a strict, blocky grid feel
    nodesep: 128, // Minimum horizontal spacing between nodes
    ranksep: 64, // Minimum vertical spacing between ranks (layers)
  });

  // 1. Feed nodes into Dagre
  nodes.forEach((node) => {
    const { width, height } = nodeSize(node);
    // Dagre needs the dimensions to accurately space the grid
    dagreGraph.setNode(node.id, { width, height });
  });

  // 2. Feed edges into Dagre
  edges.forEach((edge) => {
    if (edge.source === INTRO_NODE_ID && edge.target === SCHEDULE_CALLBACK_NODE_ID) return;
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 3. Execute the layout math
  dagre.layout(dagreGraph);

  // 4. Map the calculated positions back to the React Flow nodes
  return nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    const { width, height } = nodeSize(node);

    return {
      ...node,
      position: {
        // Dagre's x and y represent the CENTER of the node.
        // React Flow expects x and y to represent the TOP-LEFT corner.
        x: dagreNode.x - width / 2,
        y: dagreNode.y - height / 2,
      },
    };
  });
}
