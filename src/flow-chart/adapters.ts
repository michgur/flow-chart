import { layoutNodes } from "./auto-layout";
import type { Goal, Script, Transition } from "./data-model";
import {
  fieldExits,
  generateTransitionEdgeId,
  type FlowEdge,
  type FlowModel,
  type FlowNode,
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

  const nodes = goals.map<FlowNode>((goal) => {
    if (goal.nodeType === "say") {
      return {
        id: goal.id,
        type: "say",
        data: {
          name: goal.name,
          static: true,
          waitForResponse: false,
          prompt: "",
        },
        position: { x: 0, y: 0 },
      };
    }
    if (goal.nodeType === "ask") {
      const field = {
        name: goal.name,
        type: "boolean" as const,
      };

      return {
        id: goal.id,
        type: "ask",
        data: {
          name: goal.name,
          static: true,
          prompt: "",
          field,
          exits: fieldExits(field),
        },
        position: { x: 0, y: 0 },
      };
    }

    return {
      id: goal.id,
      type: "goal",
      data: {
        name: goal.name,
        messages: goal.messages,
      },
      position: { x: 0, y: 0 },
    };
  });
  const seenPairs = new Set<string>();
  const edges: FlowEdge[] = [];

  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];
    if (i < goals.length - 1 && goal.nodeType === "say") {
      edges.push({
        id: generateTransitionEdgeId(),
        source: idByGoalName.get(goal.name)!,
        target: idByGoalName.get(goals[i + 1].name)!,
      });
      continue;
    }

    for (const transition of goal.transitions ?? []) {
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
  const goalNodes = flow.nodes.filter((node) => node.type === "goal");
  const nameByGoalId = new Map<string, string>();

  for (const node of goalNodes) {
    nameByGoalId.set(node.id, node.data.name);
  }

  const goals = flow.nodes
    .filter((node) => node.type === "say" || node.type === "ask")
    .map<Goal>((node) => ({
      name: node.data.name,
      nodeType: node.type,
      messages: node.data.prompt,
    }));

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
