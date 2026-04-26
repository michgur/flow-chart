import { Panel, useStore } from "@xyflow/react";
import { type FlowNode } from "../flow-model";
import { GoalInspector } from "./GoalInspector";
import { TransitionInspector } from "./TransitionInspector";

type Selection =
  | {
      kind: "goal";
      id: string;
    }
  | {
      kind: "transition";
      id: string;
    }
  | null;

export function FlowInspector() {
  const selection = useStore((state): Selection => {
    const edge = state.edges.find((item) => item.selected);
    if (edge) {
      return {
        kind: "transition",
        id: edge.id,
      };
    }

    const node = state.nodes.find((item) => item.selected);

    if (!node || (node as FlowNode).data.kind !== "goal") return null;
    return {
      kind: "goal",
      id: node.id,
    };
  });

  if (!selection) return null;

  return (
    <Panel
      position="top-right"
      className="inset-3! inset-s-auto! m-0! w-80 space-y-3 overflow-y-auto rounded-md border border-slate-300 bg-slate-50"
    >
      {selection.kind === "goal" ? (
        <GoalInspector id={selection.id} />
      ) : (
        <TransitionInspector id={selection.id} />
      )}
    </Panel>
  );
}
