import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
  type SetStateAction,
} from "react";
import type { OnSelectionChangeFunc } from "@xyflow/react";
import { GLOBAL_NODE_ID, goalNodeId, parseGoalNodeId } from "../adapter";
import type { GoalName } from "../data-model";
import type { FlowInstance } from "../FlowChart";

export type FlowSelection =
  | { kind: "goal"; goalName: GoalName }
  | { kind: "transition"; edgeId: string }
  | { kind: "global" }
  | null;

export function useFlowSelection(flowRef: RefObject<FlowInstance | null>) {
  const [selection, setSelectionInternal] = useState<FlowSelection>(null);
  const shouldUpdate = useRef(false);

  const setSelection = useCallback(
    (selection: SetStateAction<FlowSelection>) => {
      setSelectionInternal(selection);
      shouldUpdate.current = true;
    },
    [],
  );

  const onSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes, edges }) => {
      if (edges.length > 0) {
        setSelectionInternal({ kind: "transition", edgeId: edges[0].id });
        return;
      }

      if (nodes.length > 0) {
        const selectedNode = nodes[0];

        if (selectedNode.id === GLOBAL_NODE_ID) {
          setSelectionInternal({ kind: "global" });
          return;
        }

        const goalName = parseGoalNodeId(selectedNode.id);
        setSelectionInternal(goalName ? { kind: "goal", goalName } : null);
        return;
      }

      setSelectionInternal(null);
      return;
    },
    [],
  );

  useEffect(() => {
    if (!shouldUpdate.current) return;
    shouldUpdate.current = false;

    const flow = flowRef.current;
    if (!flow) return;

    const isGoal = selection?.kind === "goal";
    flow.setNodes(
      flowSelect(
        (node) =>
          isGoal &&
          node.data.kind === "goal" &&
          node.data.goal.name === selection.goalName,
      ),
    );
    if (isGoal) {
      void flow.fitView({ padding: 0.2, duration: 300 });
    }

    const isTransition = selection?.kind === "transition";
    flow.setEdges(
      flowSelect((edge) => isTransition && edge.id === selection.edgeId),
    );
  }, [selection]);

  return { selection, setSelection, onSelectionChange };
}

function flowSelect<T extends { selected?: boolean }>(
  predicate: (item: T) => boolean | void,
) {
  return (items: T[]) =>
    items.map((item) => {
      const selected = predicate(item);
      return selected === item.selected
        ? item
        : {
            ...item,
            selected,
          };
    });
}
