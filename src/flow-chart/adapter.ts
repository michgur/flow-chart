import type { Connection, Edge, Node, XYPosition } from "@xyflow/react";
import type { GoalName, Script, Transition } from "../data-model";

const GOAL_NODE_PREFIX = "goal:";
const GOAL_EDGE_PREFIX = "goal:";
const GLOBAL_EDGE_PREFIX = "global:";

export const GLOBAL_NODE_ID = "__global_transitions__";

export type FlowNodeData = {
  label: string;
  kind: "goal" | "global";
};

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

type PositionMap = Record<string, XYPosition>;

export function extractPositions(nodes: FlowNode[]): PositionMap {
  return Object.fromEntries(nodes.map((node) => [node.id, node.position]));
}

export function buildFlowFromScript(
  script: Script,
  positions: PositionMap,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const goalNames = new Set(script.goals.map((goal) => goal.name));

  const nodes: FlowNode[] = [
    {
      id: GLOBAL_NODE_ID,
      data: { label: "Global transitions", kind: "global" },
      position: positions[GLOBAL_NODE_ID] ?? { x: 40, y: 40 },
    },
    ...script.goals.map<FlowNode>((goal, index) => {
      const nodeId = goalNodeId(goal.name);

      return {
        id: nodeId,
        data: { label: goal.name, kind: "goal" },
        position: positions[nodeId] ?? defaultGoalPosition(index),
      };
    }),
  ];

  const goalEdges = script.goals.flatMap((goal) =>
    goal.transitions.flatMap((transition, index) => {
      if (!goalNames.has(transition.target)) {
        return [];
      }

      return {
        id: `${GOAL_EDGE_PREFIX}${goal.name}:${index}`,
        source: goalNodeId(goal.name),
        target: goalNodeId(transition.target),
        label: transitionLabel(transition),
      } satisfies FlowEdge;
    }),
  );

  const globalEdges = (script.transitions ?? []).flatMap((transition, index) => {
    if (!goalNames.has(transition.target)) {
      return [];
    }

    return {
      id: `${GLOBAL_EDGE_PREFIX}${index}`,
      source: GLOBAL_NODE_ID,
      target: goalNodeId(transition.target),
      label: transitionLabel(transition),
    } satisfies FlowEdge;
  });

  return { nodes, edges: [...goalEdges, ...globalEdges] };
}

export function addTransitionFromConnection(script: Script, connection: Connection): Script {
  const sourceNodeId = connection.source;
  const targetGoalName = parseGoalNodeId(connection.target);

  if (!sourceNodeId || !targetGoalName) {
    return script;
  }

  const goalNames = new Set(script.goals.map((goal) => goal.name));

  if (!goalNames.has(targetGoalName)) {
    return script;
  }

  const transition: Transition = { target: targetGoalName, conditions: "" };

  if (sourceNodeId === GLOBAL_NODE_ID) {
    return {
      ...script,
      transitions: [...(script.transitions ?? []), transition],
    };
  }

  const sourceGoalName = parseGoalNodeId(sourceNodeId);

  if (!sourceGoalName) {
    return script;
  }

  let didUpdate = false;

  const goals = script.goals.map((goal) => {
    if (goal.name !== sourceGoalName) {
      return goal;
    }

    didUpdate = true;
    return {
      ...goal,
      transitions: [...goal.transitions, transition],
    };
  });

  if (!didUpdate) {
    return script;
  }

  return {
    ...script,
    goals,
  };
}

export function removeTransitionsByEdgeIds(script: Script, edgeIds: string[]): Script {
  const { globalTransitionIndexes, goalTransitionIndexes } = parseTransitionIndexes(edgeIds);

  if (globalTransitionIndexes.size === 0 && goalTransitionIndexes.size === 0) {
    return script;
  }

  let didChangeGoals = false;

  const goals = script.goals.map((goal) => {
    const indexesToRemove = goalTransitionIndexes.get(goal.name);

    if (!indexesToRemove || indexesToRemove.size === 0) {
      return goal;
    }

    const transitions = goal.transitions.filter((_, index) => !indexesToRemove.has(index));

    if (transitions.length === goal.transitions.length) {
      return goal;
    }

    didChangeGoals = true;

    return {
      ...goal,
      transitions,
    };
  });

  const currentGlobalTransitions = script.transitions ?? [];
  const filteredGlobalTransitions = currentGlobalTransitions.filter(
    (_, index) => !globalTransitionIndexes.has(index),
  );
  const didChangeGlobalTransitions =
    filteredGlobalTransitions.length !== currentGlobalTransitions.length;

  if (!didChangeGoals && !didChangeGlobalTransitions) {
    return script;
  }

  return {
    ...script,
    goals,
    transitions: filteredGlobalTransitions.length > 0 ? filteredGlobalTransitions : undefined,
  };
}

function goalNodeId(goalName: GoalName): string {
  return `${GOAL_NODE_PREFIX}${goalName}`;
}

function parseGoalNodeId(nodeId: string | null): GoalName | null {
  if (!nodeId || !nodeId.startsWith(GOAL_NODE_PREFIX)) {
    return null;
  }

  return nodeId.slice(GOAL_NODE_PREFIX.length);
}

function defaultGoalPosition(index: number): XYPosition {
  const column = index % 3;
  const row = Math.floor(index / 3);

  return {
    x: 320 + column * 260,
    y: row * 180,
  };
}

function transitionLabel(transition: Transition): string {
  if ("prompt" in transition) {
    return transition.prompt ? `Prompt: ${transition.prompt}` : "Prompt";
  }

  return transition.conditions ? `When: ${transition.conditions}` : "When";
}

function parseTransitionIndexes(edgeIds: string[]): {
  globalTransitionIndexes: Set<number>;
  goalTransitionIndexes: Map<GoalName, Set<number>>;
} {
  const globalTransitionIndexes = new Set<number>();
  const goalTransitionIndexes = new Map<GoalName, Set<number>>();

  for (const edgeId of edgeIds) {
    const globalTransitionIndex = parseGlobalEdgeId(edgeId);

    if (globalTransitionIndex !== null) {
      globalTransitionIndexes.add(globalTransitionIndex);
      continue;
    }

    const goalEdgeRef = parseGoalEdgeId(edgeId);

    if (!goalEdgeRef) {
      continue;
    }

    const existingIndexes = goalTransitionIndexes.get(goalEdgeRef.goalName);

    if (existingIndexes) {
      existingIndexes.add(goalEdgeRef.transitionIndex);
      continue;
    }

    goalTransitionIndexes.set(goalEdgeRef.goalName, new Set([goalEdgeRef.transitionIndex]));
  }

  return { globalTransitionIndexes, goalTransitionIndexes };
}

function parseGoalEdgeId(edgeId: string): { goalName: GoalName; transitionIndex: number } | null {
  if (!edgeId.startsWith(GOAL_EDGE_PREFIX)) {
    return null;
  }

  const serializedGoalRef = edgeId.slice(GOAL_EDGE_PREFIX.length);
  const separatorIndex = serializedGoalRef.lastIndexOf(":");

  if (separatorIndex <= 0) {
    return null;
  }

  const goalName = serializedGoalRef.slice(0, separatorIndex);
  const transitionIndex = Number.parseInt(serializedGoalRef.slice(separatorIndex + 1), 10);

  if (!Number.isInteger(transitionIndex) || transitionIndex < 0) {
    return null;
  }

  return { goalName, transitionIndex };
}

function parseGlobalEdgeId(edgeId: string): number | null {
  if (!edgeId.startsWith(GLOBAL_EDGE_PREFIX)) {
    return null;
  }

  const transitionIndex = Number.parseInt(edgeId.slice(GLOBAL_EDGE_PREFIX.length), 10);

  if (!Number.isInteger(transitionIndex) || transitionIndex < 0) {
    return null;
  }

  return transitionIndex;
}
