import { layoutNodes } from "./auto-layout";
import type {
  AskGoal,
  Goal,
  Script,
  SayGoal,
  SubagentGoal,
} from "./data-model";
import {
  generateTransitionEdgeId,
  type AskNodeData,
  type FlowModel,
  type FlowNode,
} from "./flow-model";
import { invert } from "./lib/utils";
import { syncExits } from "./sync-exits";

const goalValueTypes: Record<
  AskNodeData["field"]["type"],
  AskGoal["value_type"]
> = {
  boolean: "approval",
  enum: "selection",
  string: "custom",
  number: "number",
};

const fieldTypes = invert(goalValueTypes);

function sanitizeSay(raw: Record<string, unknown>): SayGoal {
  return { ...raw, transitions: raw.transitions ?? [] } as SayGoal;
}

function sanitizeAsk(raw: Record<string, unknown>): AskGoal {
  return { ...raw, transitions: raw.transitions ?? [] } as AskGoal;
}

function sanitizeSubagent(raw: Record<string, unknown>): SubagentGoal {
  return {
    ...raw,
    transitions: raw.transitions ?? [],
  } as SubagentGoal;
}

function sanitizeGoal(raw: Record<string, unknown>): Goal {
  const goalType = typeof raw.goal_type === "string" ? raw.goal_type : "ask";
  if (goalType === "say_generative" && raw.repeat) return sanitizeSubagent(raw);
  else if (["ask", "ask_generative"].includes(goalType))
    return sanitizeAsk(raw);
  return sanitizeSay(raw);
}

export function sanitizeScript(raw: unknown): Script {
  if (typeof raw !== "object") return { goals: [] };
  const obj = raw as Record<string, unknown>;

  const goals = (Array.isArray(obj.goals) ? obj.goals : [])
    .filter((g: unknown): g is Record<string, unknown> => typeof g === "object")
    .map(sanitizeGoal);

  return { goals };
}

export function scriptToFlowModel(script: Script): FlowModel {
  const goals = script.goals.map((goal, index) => ({
    id: `goal:${index}`,
    goal,
  }));
  const idByName = new Map(goals.map(({ id, goal }) => [goal.name, id]));
  const edges = goals.flatMap(({ id, goal }) =>
    goal.transitions.flatMap((transition) => {
      const target =
        transition.target !== undefined && idByName.get(transition.target);
      return target
        ? [
            {
              id: generateTransitionEdgeId(),
              source: id,
              sourceHandle: isSayGoal(goal) ? null : (transition.name ?? ""),
              target,
            },
          ]
        : [];
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
          name: transition.name ?? "",
          conditions: transition.conditions,
          acknowledge: transition.acknowledge,
        })),
      },
      position: { x: 0, y: 0 },
    };
  });

  const flow = syncExits({ nodes, edges });
  return {
    nodes: layoutNodes(flow.nodes, flow.edges),
    edges,
  };
}

export function flowModelToScript(flow: FlowModel): Script {
  const nodes = flow.nodes.filter(
    (node) =>
      node.type === "say" || node.type === "ask" || node.type === "subagent",
  );
  const exitIds = new Set(
    flow.nodes.filter((node) => node.type === "exit").map((node) => node.id),
  );
  const nameById = new Map(
    nodes.map((node) => [node.id, toFieldName(node.data.name)]),
  );
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
          transitions: target ? [{ target }] : [],
        };
      }

      if (node.type === "subagent") {
        return {
          name: toFieldName(node.data.name),
          goal_type: "say_generative",
          messages: node.data.prompt || undefined,
          repeat: true,
          transitions: node.data.exits.map((exit) => {
            const target = targetFor(node.id, exit.name);
            return {
              name: exit.name,
              prompt: exit.prompt,
              target: target || undefined,
            };
          }),
        };
      }

      return {
        ...goal,
        goal_type: node.data.static ? "ask" : "ask_generative",
        value_type: goalValueTypes[node.data.field.type] ?? "custom",
        validation_prompt: node.data.field.description,
        choices:
          node.data.field.type === "enum"
            ? node.data.field.enum?.filter(Boolean).map((name) => ({ name }))
            : undefined,
        transitions: node.data.exits.map((exit) => ({
          name: exit.name,
          target: targetFor(node.id, exit.name) || undefined,
          conditions: exit.conditions,
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
  return (
    !isSubagentGoal(goal) &&
    (goal.goal_type === "say" || goal.goal_type === "say_generative")
  );
}

function isSubagentGoal(goal: Goal): goal is SubagentGoal {
  return goal.goal_type === "say_generative" && "repeat" in goal && goal.repeat;
}

function firstMessage(messages: string | string[] | undefined): string {
  return Array.isArray(messages) ? (messages[0] ?? "") : (messages ?? "");
}

function askField(goal: AskGoal): AskNodeData["field"] {
  return {
    name: goal.name,
    type: fieldTypes[goal.value_type ?? "custom"],
    enum:
      goal.value_type === "selection"
        ? goal.choices?.map((choice) => choice.name)
        : undefined,
    optional:
      goal.transitions.some((transition) => transition.refusal_handler) ||
      undefined,
    description: goal.validation_prompt,
  };
}
