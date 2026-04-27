import { layoutNodes } from "./auto-layout";
import type { AskGoal, Goal, Script, SayGoal, SubagentGoal } from "./data-model";
import {
  generateTransitionEdgeId,
  type AskNodeData,
  type FlowModel,
  type FlowNode,
  type NodeExit,
} from "./flow-model";
import { syncExits } from "./sync-exits";

export function scriptToFlowModel(script: Script): FlowModel {
  const goals = script.goals.map((goal, index) => ({ id: `goal:${index}`, goal }));
  const idByName = new Map(goals.map(({ id, goal }) => [goal.name, id]));
  const edges = goals.flatMap(({ id, goal }) =>
    goal.transitions.flatMap((transition) => {
      const targets = Array.isArray(transition.target)
        ? transition.target
        : transition.target
          ? [transition.target]
          : [];

      return targets.flatMap((name) => {
        const target = idByName.get(name);
        return target
          ? [
              {
                id: generateTransitionEdgeId(),
                source: id,
                sourceHandle: isSayGoal(goal) ? null : transition.name,
                target,
                animated: true,
              },
            ]
          : [];
      });
    }),
  );
  const nodes = goals.map<FlowNode>(({ id, goal }) => {
    if (isSubagentGoal(goal)) {
      return {
        id,
        type: "subagent",
        data: {
          name: goal.name,
          prompt: firstMessage(goal.messages),
          exits: goal.transitions.map(({ name, prompt }) => ({ name, prompt })),
        },
        position: { x: 0, y: 0 },
      };
    }

    if (isSayGoal(goal)) {
      return {
        id,
        type: "say",
        data: {
          name: goal.display_name ?? goal.name,
          static: goal.goal_type === "say",
          prompt: firstMessage(goal.messages),
          waitForResponse: goal.appended !== true,
        },
        position: { x: 0, y: 0 },
      };
    }

    return {
      id,
      type: "ask",
      data: {
        name: goal.display_name ?? goal.name,
        static: goal.goal_type === "ask",
        prompt: firstMessage(goal.messages),
        field: askField(goal),
        exits: goal.transitions.map((transition) => ({
          name: transition.name,
          value: transition.refusal_handler ? null : exitValue(goal, transition.conditions),
          acknowledge: transition.acknowledge,
        })),
      },
      position: { x: 0, y: 0 },
    };
  });

  return syncExits({ nodes: layoutNodes(nodes, edges), edges });
}

export function flowModelToScript(flow: FlowModel): Script {
  const nodes = flow.nodes.filter(
    (node) => node.type === "say" || node.type === "ask" || node.type === "subagent",
  );
  const exitIds = new Set(flow.nodes.filter((node) => node.type === "exit").map((node) => node.id));
  const nameById = new Map(nodes.map((node) => [node.id, toFieldName(node.data.name)]));
  const targetsFor = (source: string, handle: string | null) =>
    flow.edges.flatMap((edge) => {
      if (
        edge.source !== source ||
        (edge.sourceHandle ?? null) !== handle ||
        exitIds.has(edge.target)
      ) {
        return [];
      }

      const target = nameById.get(edge.target);
      return target ? [target] : [];
    });
  const targetFor = (source: string, handle: string | null) => {
    return targetsFor(source, handle)[0];
  };

  return {
    goals: nodes.map<Goal>((node) => {
      const goal = {
        name: toFieldName(node.data.name),
        display_name: node.data.name,
        messages: node.data.prompt || undefined,
      };

      if (node.type === "say") {
        const target = targetFor(node.id, null);
        return {
          ...goal,
          goal_type: node.data.static ? "say" : "say_generative",
          appended: node.data.waitForResponse ? undefined : true,
          transitions: target ? [{ name: "next", target }] : [],
        };
      }

      if (node.type === "subagent") {
        return {
          name: toFieldName(node.data.name),
          is_subagent: true,
          goal_type: "say_generative",
          messages: node.data.prompt || undefined,
          repeat: true,
          transitions: node.data.exits.map((exit) => {
            const target = targetsFor(node.id, exit.name);
            return {
              name: exit.name,
              prompt: exit.prompt,
              target: target.length > 0 ? target : undefined,
            };
          }),
        };
      }

      return {
        ...goal,
        goal_type: node.data.static ? "ask" : "ask_generative",
        value_type: node.data.field.type === "boolean" ? "approval" : "selection",
        choices:
          node.data.field.type === "enum"
            ? node.data.field.enum?.filter(Boolean).map((name) => ({ name }))
            : undefined,
        transitions: node.data.exits.map((exit) => ({
          name: exit.name,
          target: targetFor(node.id, exit.name),
          conditions: conditionValue(exit.value),
          refusal_handler: exit.value === null ? true : undefined,
          acknowledge: exit.acknowledge,
        })),
      };
    }),
  };
}

export function toFieldName(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_']+/g, "-")
    .replace(/-+/g, "-");
  return slug.replace(/^-+|-+$/g, "");
}

function isSayGoal(goal: Goal): goal is SayGoal {
  return !isSubagentGoal(goal) && (goal.goal_type === "say" || goal.goal_type === "say_generative");
}

function isSubagentGoal(goal: Goal): goal is SubagentGoal {
  return "is_subagent" in goal;
}

function firstMessage(messages: string | string[] | undefined): string {
  return Array.isArray(messages) ? (messages[0] ?? "") : (messages ?? "");
}

function askField(goal: AskGoal): AskNodeData["field"] {
  return {
    name: goal.name,
    type: goal.value_type === "approval" ? "boolean" : "enum",
    enum: goal.value_type === "selection" ? goal.choices?.map((choice) => choice.name) : undefined,
    optional: goal.transitions.some((transition) => transition.refusal_handler) || undefined,
  };
}

function exitValue(goal: AskGoal, conditions: string | undefined): NodeExit["value"] {
  if (conditions === undefined) return undefined;
  if (goal.value_type === "approval") {
    return conditions === "yes" ? true : conditions === "no" ? false : conditions;
  }
  return conditions;
}

function conditionValue(value: NodeExit["value"]): string | undefined {
  return value === true ? "yes" : value === false ? "no" : (value ?? undefined);
}
