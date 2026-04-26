import { useCallback, useRef, useState } from "react";
import {
  type OnConnect,
  type OnReconnect,
  type IsValidConnection,
  type NodeChange,
  type EdgeChange,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import type { Script } from "../data-model";
import { flowModelToScript, scriptToFlowModel } from "../adapters";
import { generateTransitionEdgeId, type FlowEdge, type FlowNode } from "../flow-model";

type OnChange = (next: Script) => void;

function isSemanticNodeChange(change: NodeChange<FlowNode>): boolean {
  return ["remove", "add", "replace"].includes(change.type);
}

function isSemanticEdgeChange(change: EdgeChange<FlowEdge>): boolean {
  return ["remove", "add", "replace"].includes(change.type);
}

function scriptsEqual(a: Script, b: Script): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useScriptFlow(value: Script, onChange: OnChange) {
  const [initial] = useState(() => scriptToFlowModel(value));
  const [nodes, setNodes] = useState(initial.nodes);
  const [edges, setEdges] = useState(initial.edges);

  const valueRef = useRef(value);

  if (!scriptsEqual(value, valueRef.current)) {
    valueRef.current = value;
    const next = scriptToFlowModel(value);
    setNodes(next.nodes);
    setEdges(next.edges);
  }

  const emit = useCallback(
    (nextNodes: FlowNode[], nextEdges: FlowEdge[]) => {
      const nextModel = flowModelToScript({
        nodes: nextNodes,
        edges: nextEdges,
      });
      if (scriptsEqual(nextModel, valueRef.current)) return;
      valueRef.current = nextModel;
      onChange(nextModel);
    },
    [onChange],
  );

  const onNodesChange: OnNodesChange<FlowNode> = useCallback(
    (changes) =>
      setNodes((prev) => {
        const next = applyNodeChanges(changes, prev);
        if (changes.some(isSemanticNodeChange)) emit(next, edges);
        return next;
      }),
    [setNodes, edges, emit],
  );

  const onEdgesChange: OnEdgesChange<FlowEdge> = useCallback(
    (changes) =>
      setEdges((prev) => {
        const next = applyEdgeChanges(changes, prev);
        if (changes.some(isSemanticEdgeChange)) emit(nodes, next);
        return next;
      }),
    [setEdges, nodes, emit],
  );

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((edges) => {
        const next = [...edges, newEdge(connection.source, connection.target)];
        emit(nodes, next);
        return next;
      }),
    [setEdges, nodes, emit],
  );

  const isValidConnection: IsValidConnection<FlowEdge> = useCallback(
    (connection) => {
      const { source, target } = connection;
      if (source === target) return false;
      return !edges.some((e) => e.source === source && e.target === target);
    },
    [edges],
  );

  const onReconnect: OnReconnect<FlowEdge> = useCallback(
    (oldEdge, nextConnection) =>
      setEdges((edges) => {
        const next = edges.map((edge) =>
          edge.id === oldEdge.id
            ? {
                ...edge,
                source: nextConnection.source,
                target: nextConnection.target,
              }
            : edge,
        );
        emit(nodes, next);
        return next;
      }),
    [setEdges, nodes, emit],
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    isValidConnection,
  } as const;
}

function newEdge(source: string, target: string): FlowEdge {
  return {
    id: generateTransitionEdgeId(),
    source,
    target,
    label: "transition",
    data: {
      kind: "transition" as const,
      name: "transition",
      conditions: "",
    },
    animated: true,
  };
}
