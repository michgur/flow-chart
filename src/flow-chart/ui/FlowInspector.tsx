import { Panel } from "@xyflow/react";
import type { GoalWithoutId } from "../data-model";
import type { FlowSelection } from "../hooks/use-flow-selection";
import { getGoal, getTransition } from "../script-actions";
import { GoalInspector } from "./GoalInspector";
import { TransitionInspector } from "./TransitionInspector";

type FlowInspectorProps = {
  selection: FlowSelection;
};

export function FlowInspector({ selection }: FlowInspectorProps) {
  if (selection?.kind !== "goal" && selection?.kind !== "transition")
    return null;

  return (
    <Panel
      position="top-right"
      className="inset-3! inset-s-auto! m-0! w-80 space-y-3 overflow-y-auto rounded-md border border-slate-300 bg-slate-50"
    >
      {selection.kind === "goal" ? (
        <GoalInspector goalId={selection.id} />
      ) : (
        <TransitionInspector transitionId={selection.id} />
      )}
    </Panel>
  );
}
