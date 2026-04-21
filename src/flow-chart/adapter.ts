import type { Edge, Node, XYPosition } from "@xyflow/react";
import type { Goal, GoalName, Script, Transition } from "./data-model";

export const GOAL_NODE_PREFIX = "goal:";
export const GOAL_EDGE_PREFIX = "goal:";
export const GLOBAL_EDGE_PREFIX = "global:";
export const GLOBAL_NODE_ID = "__global_transitions__";

export type GoalFlowNodeData = {
  kind: "goal";
  goal: Pick<Goal, "name">;
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
  const goalNames = new Set(model.goals.map((goal) => goal.name));
  const positions = options?.positions ?? {};

  const nodes: FlowNode[] = [
    {
      id: GLOBAL_NODE_ID,
      data: { label: "Global transitions", kind: "global" },
      position: positions[GLOBAL_NODE_ID] ?? { x: 40, y: 40 },
      selected: GLOBAL_NODE_ID === options?.selected,
      deletable: false,
    },
    ...model.goals.map<FlowNode>((goal, index) => {
      const nodeId = goalNodeId(goal.name);
      let pos = positions[nodeId];
      if (!pos) {
        const src = model.goals.find((g) => g.transitions.some((t) => t.target === goal.name));
        if (src) {
          const srcPos = positions[goalNodeId(src.name)];
          if (srcPos) {
            pos = {
              x: srcPos.x,
              y: srcPos.y + 100,
            };
          }
        }
      }

      return {
        id: nodeId,
        type: "goal",
        data: {
          kind: "goal",
          goal: { name: goal.name },
        },
        position: goalPosition(model, index, positions),
        selected: !!nodeId && nodeId === options?.selected,
      };
    }),
  ];

  const goalEdges = model.goals.flatMap((goal) =>
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

  const globalEdges = (model.transitions ?? []).flatMap((transition, index) => {
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

export function parseGoalNodeId(nodeId: string | null): GoalName | null {
  if (!nodeId || !nodeId.startsWith(GOAL_NODE_PREFIX)) {
    return null;
  }

  return nodeId.slice(GOAL_NODE_PREFIX.length);
}

export function goalNodeId(goalName: GoalName): string {
  return `${GOAL_NODE_PREFIX}${goalName}`;
}

function goalPosition(model: Script, index: number, positions: PositionMap) {
  const goalName = model.goals[index].name;
  const pos = positions[goalNodeId(goalName)];
  if (pos) return pos;

  const src = model.goals.find((g) => g.transitions.some((t) => t.target === goalName));
  if (src) {
    const srcPos = positions[goalNodeId(src.name)];
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
