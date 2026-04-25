import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Script } from "../data-model";
import type {
  IsValidConnection,
  OnConnect,
  OnDelete,
  OnReconnect,
} from "@xyflow/react";
import { edgeToTransitionId } from "../script-adapter";
import { useLatest } from "./use-latest";
import {
  addTransition,
  canAddTransition,
  changeTransitionTarget,
  deleteGoalsAndTransitions,
} from "../script-actions";

export function useFlowScriptActions(
  model: Script,
  onChange: Dispatch<SetStateAction<Script>>,
) {
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
    (connection) =>
      onChange((model) => addTransition(model, edgeToTransitionId(connection))),
    [onChange],
  );

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newEdge) =>
      onChange((model) =>
        changeTransitionTarget(
          model,
          edgeToTransitionId(oldEdge),
          edgeToTransitionId(newEdge),
        ),
      ),
    [onChange],
  );

  return {
    onConnect,
    onReconnect,
    onDelete,
    isValidConnection,
  };
}
