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
import { useCallback, useReducer, useRef } from "react";

import { flowModelToScript, scriptToFlowModel } from "../adapters";
import type { Script } from "../data-model";
import { generateTransitionEdgeId, type FlowEdge, type FlowNode } from "../flow-model";
import { syncExits } from "../sync-exits";

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
  const ref = useRef<{
    nodes: FlowNode[];
    edges: FlowEdge[];
    value: Script;
  }>(null);
  if (ref.current === null || !scriptsEqual(ref.current.value, value)) {
    ref.current = {
      value,
      ...syncExits(scriptToFlowModel(value)),
    };
  }

  const [, forceUpdate] = useReducer((x) => !x, false);
  const update = useCallback(
    (emit = true) => {
      if (ref.current) {
        Object.assign(ref.current, syncExits(ref.current));
        if (emit) {
          const next = flowModelToScript(ref.current);
          if (!scriptsEqual(next, ref.current.value)) {
            ref.current.value = next;
            onChange(next);
          }
        }
      }
      forceUpdate();
    },
    [onChange, forceUpdate],
  );

  const onNodesChange: OnNodesChange<FlowNode> = useCallback(
    (changes) => {
      if (!ref.current) return;
      ref.current.nodes = applyNodeChanges(changes, ref.current.nodes);
      update(changes.some(isSemanticNodeChange));
    },
    [update],
  );

  const onEdgesChange: OnEdgesChange<FlowEdge> = useCallback(
    (changes) => {
      if (!ref.current) return;
      ref.current.edges = applyEdgeChanges(changes, ref.current.edges);
      update(changes.some(isSemanticEdgeChange));
    },
    [update],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!ref.current) return;
      ref.current.edges = [
        ...ref.current.edges.filter(
          (edge) =>
            edge.source !== connection.source ||
            (edge.sourceHandle ?? null) !== (connection.sourceHandle ?? null),
        ),
        {
          id: generateTransitionEdgeId(),
          source: connection.source,
          sourceHandle: connection.sourceHandle ?? null,
          target: connection.target,
          targetHandle: connection.targetHandle ?? null,
        },
      ];
      update();
    },
    [update],
  );

  const isValidConnection: IsValidConnection<FlowEdge> = useCallback(
    (connection) => connection.source !== connection.target,
    [],
  );

  const onReconnect: OnReconnect<FlowEdge> = useCallback(
    (oldEdge, nextConnection) => {
      if (!ref.current) return;
      ref.current.edges = ref.current.edges.flatMap((edge) => {
        if (edge.id === oldEdge.id) {
          return [
            {
              ...edge,
              source: nextConnection.source,
              sourceHandle: nextConnection.sourceHandle ?? null,
              target: nextConnection.target,
              targetHandle: nextConnection.targetHandle ?? null,
            },
          ];
        }

        if (
          edge.source === nextConnection.source &&
          (edge.sourceHandle ?? null) === (nextConnection.sourceHandle ?? null)
        ) {
          return [];
        }

        return [edge];
      });
      update();
    },
    [update],
  );

  return {
    nodes: ref.current.nodes,
    edges: ref.current.edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    isValidConnection,
  } as const;
}
