import type {
  Goal,
  GoalName as GoalNameValue,
  Script,
  Transition,
} from "../data-model";
import type { FlowSelection } from "../hooks/use-flow-selection";
import { findTransition } from "../script-ops";
import { GoalInspector } from "./GoalInspector";
import { TransitionInspector } from "./TransitionInspector";

type FlowInspectorProps = {
  model: Script;
  selection: FlowSelection;
  onChangeGoal: (currentGoalName: GoalNameValue, nextGoal: Goal) => void;
  onChangeTransition: (edgeId: string, nextTransition: Transition) => void;
};

export function FlowInspector({
  model,
  selection,
  onChangeGoal,
  onChangeTransition,
}: FlowInspectorProps) {
  const selectedGoal =
    selection?.kind === "goal"
      ? (model.goals.find((goal) => goal.name === selection.goalName) ?? null)
      : null;
  const selectedTransition =
    selection?.kind === "transition"
      ? {
          transition: findTransition(model, selection.edgeId),
          edgeId: selection.edgeId,
        }
      : null;
  return (
    <aside className="h-full w-80 space-y-3 overflow-y-auto rounded-md border border-slate-300 bg-slate-50">
      {selectedGoal ? (
        <GoalInspector
          value={selectedGoal}
          onChange={(nextGoal) => onChangeGoal(selectedGoal.name, nextGoal)}
        />
      ) : null}

      {selectedTransition?.transition ? (
        <TransitionInspector
          value={selectedTransition.transition}
          onChange={(nextTransition) =>
            onChangeTransition(selectedTransition.edgeId, nextTransition)
          }
        />
      ) : null}
    </aside>
  );
}
