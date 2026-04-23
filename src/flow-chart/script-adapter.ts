import type { Edge, Node, XYPosition } from "@xyflow/react";
import type { Goal, Script, Transition, TransitionId } from "./data-model";

export const GLOBAL_NODE_ID = "__global_transitions__";

export function edgeToTransitionId(
  edge: Pick<Edge, "source" | "target">,
): TransitionId {
  return {
    source: edge.source === GLOBAL_NODE_ID ? null : edge.source,
    target: edge.target,
  };
}

export function generateGoalId(): string {
  return `goal:${crypto.randomUUID()}`;
}

function generateEdgeId(sourceId: string, targetId: string): string {
  return `edge:${sourceId}->${targetId}`;
}

export function goalDisplayName(goalName: string): string {
  return (
    goalName
      .split("-")
      .filter((segment) => segment.length > 0)
      .map((segment) => `${segment[0].toUpperCase()}${segment.slice(1)}`)
      .join(" ") || "Untitled goal"
  );
}

export type GoalFlowNodeData = {
  kind: "goal";
  goal: Pick<Goal, "id" | "name">;
};

export type GlobalFlowNodeData = {
  kind: "global";
  label: string;
};

export type FlowNodeData = GoalFlowNodeData | GlobalFlowNodeData;

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export type GraphOptions = {
  positions?: PositionMap;
  selected?: string | null;
};

export type PositionMap = Record<string, XYPosition>;

export function extractPositions(nodes: FlowNode[]): PositionMap {
  return Object.fromEntries(nodes.map((node) => [node.id, node.position]));
}

export function modelToGraph(
  model: Script,
  options?: GraphOptions,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const goalIdByName = new Map<string, string>();
  for (const goal of model.goals) {
    if (!goalIdByName.has(goal.name)) {
      goalIdByName.set(goal.name, goal.id);
    }
  }

  const positions = options?.positions ?? {};

  const nodes: FlowNode[] = [
    {
      id: GLOBAL_NODE_ID,
      data: { label: "Global transitions", kind: "global" },
      position: positions[GLOBAL_NODE_ID] ?? { x: 40, y: 40 },
      selected: GLOBAL_NODE_ID === options?.selected,
      deletable: false,
    },
    ...model.goals.map<FlowNode>((goal, index) => ({
      id: goal.id,
      type: "goal",
      data: {
        kind: "goal",
        goal: { id: goal.id, name: goal.name },
      },
      position: goalPosition(model, index, positions),
      selected: goal.id === options?.selected,
    })),
  ];

  const goalEdges = model.goals.flatMap((goal) =>
    goal.transitions.flatMap((transition) => {
      const targetGoalId = goalIdByName.get(transition.target);

      if (!targetGoalId) {
        return [];
      }

      return {
        id: generateEdgeId(goal.id, targetGoalId),
        source: goal.id,
        target: targetGoalId,
        label: transitionLabel(transition),
      } satisfies FlowEdge;
    }),
  );

  const globalEdges = (model.transitions ?? []).flatMap((transition) => {
    const targetGoalId = goalIdByName.get(transition.target);

    if (!targetGoalId) {
      return [];
    }

    return {
      id: generateEdgeId(GLOBAL_NODE_ID, targetGoalId),
      source: GLOBAL_NODE_ID,
      target: targetGoalId,
      label: transitionLabel(transition),
    } satisfies FlowEdge;
  });

  return { nodes, edges: [...goalEdges, ...globalEdges] };
}

function goalPosition(model: Script, index: number, positions: PositionMap) {
  const goal = model.goals[index];
  const pos = positions[goal.id];
  if (pos) return pos;

  const src = model.goals.find((g) =>
    g.transitions.some((t) => t.target === goal.name),
  );
  if (src) {
    const srcPos = positions[src.id];
    if (srcPos) {
      return {
        x: srcPos.x,
        y: srcPos.y + 100,
      };
    }
  }

  const column = index % 3;
  const row = Math.floor(index / 3);
  return {
    x: 320 + column * 260,
    y: row * 180,
  };
}

function transitionLabel(transition: Transition): string {
  return transition.name;
}
