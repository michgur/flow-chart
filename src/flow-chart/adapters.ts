import { layoutNodes } from "./auto-layout";
import type { Script, Transition } from "./data-model";
import {
  generateTransitionEdgeId,
  type FlowEdge,
  type FlowModel,
  type FlowNode,
  type GoalNode,
} from "./flow-model";

export function scriptToFlowModel(script: Script): FlowModel {
  const goals = script.goals.map((goal, index) => ({
    id: `goal:${index}`,
    ...goal,
  }));

  const idByGoalName = new Map<string, string>();
  for (const goal of goals) {
    if (!idByGoalName.has(goal.name)) {
      idByGoalName.set(goal.name, goal.id);
    }
  }

  const nodes = goals.map<FlowNode>((goal) => ({
    id: goal.id,
    type: "goal",
    data: {
      kind: "goal",
      name: goal.name,
      messages: goal.messages,
    },
    position: { x: 0, y: 0 },
  }));
  const seenPairs = new Set<string>();
  const edges: FlowEdge[] = [];

  for (const goal of goals) {
    for (const transition of goal.transitions) {
      const target = idByGoalName.get(transition.target);
      if (!target) continue;

      const key = `${goal.id}->${target}`;
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);

      edges.push(transitionToEdge(goal.id, target, transition));
    }
  }

  return { nodes: layoutNodes(nodes, edges), edges };
}

export function flowModelToScript(flow: FlowModel): Script {
  const goalNodes = flow.nodes.filter((node) => node.data.kind === "goal");
  const nameByGoalId = new Map<string, string>();

  for (const node of goalNodes) {
    if (node.data.kind !== "goal") continue;
    nameByGoalId.set(node.id, node.data.name);
  }

  const goals = goalNodes
    .filter((node): node is GoalNode => node.data.kind === "goal")
    .map((node) => {
      const seenTargets = new Set<string>();
      const transitions = flow.edges.flatMap((edge) => {
        if (edge.source !== node.id) return [];
        if (seenTargets.has(edge.target)) return [];

        const target = nameByGoalId.get(edge.target);
        if (!target) return [];

        seenTargets.add(edge.target);
        return edgeToTransition(edge, target);
      });

      return {
        name: node.data.name,
        messages: node.data.messages,
        transitions,
      };
    });

  return {
    goals,
  };
}

function transitionToEdge(source: string, target: string, transition: Transition): FlowEdge {
  return {
    id: generateTransitionEdgeId(),
    source,
    target,
    label: transition.name,
    data: {
      kind: "transition",
      name: transition.name,
      conditions: transition.conditions,
      prompt: transition.prompt,
    },
    animated: true,
  };
}

function edgeToTransition(edge: FlowEdge, target: string): Transition {
  const transition: Transition = {
    name: edge.data?.name ?? "transition",
    target,
  };

  if (edge.data?.conditions !== undefined) {
    transition.conditions = edge.data.conditions;
  }

  if (edge.data?.prompt !== undefined) {
    transition.prompt = edge.data.prompt;
  }

  return transition;
}
