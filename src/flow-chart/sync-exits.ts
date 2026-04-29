import type { FlowEdge, FlowModel, FlowNode } from "./flow-model";

const exitSize = 16;

function nodeExits(node: FlowNode) {
  return node.type === "ask" || node.type === "subagent" ? node.data.exits : [];
}

function exitNodeId(source: string, handle: string): string {
  return `exit:${source}:${handle}`;
}

function exitEdgeId(source: string, handle: string): string {
  return `edge:${exitNodeId(source, handle)}`;
}

function exitKey(source: string, handle: string): string {
  return `${source}\u0000${handle}`;
}

function exitPosition(node: FlowNode, index: number, count: number) {
  const width = node.measured?.width ?? 256;
  const height = node.measured?.height ?? 96;

  return {
    x:
      node.position.x +
      width / 2 +
      (index - (count - 1) / 2) * (width / 2) -
      exitSize / 2,
    y: node.position.y + height + 72,
  };
}

export function syncExits(flow: FlowModel): FlowModel {
  const exitIds = new Set(
    flow.nodes.filter((node) => node.type === "exit").map((node) => node.id),
  );
  const exitsById = new Map(
    flow.nodes
      .filter((node) => node.type === "exit")
      .map((node) => [node.id, node]),
  );
  const collapsedEdgeIds = new Set<string>();
  const directEdges: FlowEdge[] = [];

  for (const node of flow.nodes) {
    if (node.type !== "exit") continue;

    const incoming = flow.edges.find((edge) => edge.target === node.id);
    const outgoing = flow.edges.find(
      (edge) => edge.source === node.id && !exitIds.has(edge.target),
    );

    if (!incoming || !outgoing) continue;

    collapsedEdgeIds.add(incoming.id);
    collapsedEdgeIds.add(outgoing.id);
    directEdges.push({
      ...incoming,
      target: outgoing.target,
      targetHandle: outgoing.targetHandle ?? null,
      reconnectable: undefined,
    });
  }

  const sourceExits = new Map(
    flow.nodes
      .filter((node) => node.type !== "exit")
      .map((node) => [
        node.id,
        new Set(nodeExits(node).map((exit) => exit.name)),
      ]),
  );
  const multiTargetSources = new Set(
    flow.nodes
      .filter((node) => node.type === "subagent")
      .map((node) => node.id),
  );
  const connected = new Set<string>();
  const realEdges = [
    ...flow.edges.filter((edge) => !collapsedEdgeIds.has(edge.id)),
    ...directEdges,
  ].filter((edge) => !exitIds.has(edge.source) && !exitIds.has(edge.target));
  const edges: FlowEdge[] = [];

  for (const edge of realEdges) {
    const handle = edge.sourceHandle ?? undefined;
    const exits = sourceExits.get(edge.source);

    if (handle === undefined || !exits?.has(handle)) {
      edges.push(edge);
      continue;
    }

    const key = exitKey(edge.source, handle);
    if (!multiTargetSources.has(edge.source) && connected.has(key)) continue;

    connected.add(key);
    edges.push({
      ...edge,
      label: handle,
      reconnectable: undefined,
    });
  }

  const nodes = flow.nodes.filter((node) => node.type !== "exit");
  const exitNodes: FlowNode[] = [];
  for (const node of nodes) {
    const exits = nodeExits(node);

    exits.forEach((exit, index) => {
      if (connected.has(exitKey(node.id, exit.name))) return;

      const id = exitNodeId(node.id, exit.name);
      const current = exitsById.get(id);
      exitNodes.push({
        ...current,
        id,
        type: "exit",
        data: { name: exit.name },
        position: exitPosition(node, index, exits.length),
        draggable: false,
        selectable: false,
        deletable: false,
      });
      edges.push({
        id: exitEdgeId(node.id, exit.name),
        source: node.id,
        sourceHandle: exit.name,
        target: id,
        label: exit.name,
        reconnectable: false,
        type: "bezier",
      });
    });
  }

  return {
    nodes: [...nodes, ...exitNodes],
    edges,
  };
}
