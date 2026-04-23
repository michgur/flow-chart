import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Goal, GoalWithoutId, Script, Transition, TransitionId } from "../data-model";
import type { IsValidConnection, OnConnect, OnDelete, OnReconnect } from "@xyflow/react";
import { edgeToTransitionId } from "../adapter";
import { useLatest } from "./use-latest";
import {
  addTransition,
  canAddTransition,
  changeTransitionTarget,
  deleteGoalsAndTransitions,
  addGoalAfter,
  updateGoal,
  updateTransition,
} from "../script-actions";

export function useFlowScriptActions(model: Script, onChange: Dispatch<SetStateAction<Script>>) {
  const modelRef = useLatest(model);

  const onDelete: OnDelete = useCallback(
    ({ nodes, edges }) =>
      onChange((model) =>
        deleteGoalsAndTransitions(
          model,
          nodes.map((n) => n.id),
          edges.map(edgeToTransitionId),
        ),
      ),
    [onChange],
  );

  const isValidConnection: IsValidConnection = useCallback(
    (edge) => canAddTransition(modelRef.current, edgeToTransitionId(edge)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => onChange((model) => addTransition(model, edgeToTransitionId(connection))),
    [onChange],
  );

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newEdge) =>
      onChange((model) =>
        changeTransitionTarget(model, edgeToTransitionId(oldEdge), edgeToTransitionId(newEdge)),
      ),
    [onChange],
  );

  const onAddGoalAfter = useCallback(
    (after: string, options: Partial<Goal> = {}) =>
      onChange((model) => addGoalAfter(model, after, options)),
    [onChange],
  );

  const onUpdateGoal = useCallback(
    (goalId: string, goal: GoalWithoutId) => onChange((model) => updateGoal(model, goalId, goal)),
    [onChange],
  );

  const onUpdateTransition = useCallback(
    (transitionId: TransitionId, transition: Transition) =>
      onChange((model) => updateTransition(model, transitionId, transition)),
    [onChange],
  );

  return {
    onConnect,
    onReconnect,
    onDelete,
    isValidConnection,
    onAddGoalAfter,
    onUpdateGoal,
    onUpdateTransition,
  };
}
