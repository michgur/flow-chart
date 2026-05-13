import type {
  AskGoal,
  Goal,
  GoalMessages,
  HangupGoal,
  NewCallGoal,
  SayGoal,
  SubagentGoal,
} from "../data-model";
import {
  SCHEDULE_CALLBACK_NODE_ID,
  type AskNodeData,
  type FlowModel,
  type FlowNode,
} from "../flow-model";
import { invert } from "../lib/utils";

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

type NodeTypeToGoal = {
  say: SayGoal;
  ask: AskGoal;
  subagent: SubagentGoal;
  newcall: NewCallGoal;
  hangup: HangupGoal;
};

type GoalNodeType = keyof NodeTypeToGoal;
type GoalNode = Extract<FlowNode, { type: GoalNodeType }>;

const nodeToGoalByNodeType: {
  [NT in GoalNodeType]: (
    node: Extract<FlowNode, { type: NT }>,
    flow: FlowModel,
  ) => NodeTypeToGoal[NT];
} = {
  say: (node, flow) => {
    const target = resolveTransitionTarget(flow, node.id, null);
    return {
      name: toFieldName(node.data.name),
      display_name: node.data.name,
      messages: node.data.prompt || undefined,
      goal_type: node.data.static ? "say" : "say_generative",
      appended: node.data.waitForResponse ? undefined : true,
      transitions: target ? [{ target }] : [],
    };
  },
  ask: (ask, flow) => ({
    name: toFieldName(ask.data.name),
    display_name: ask.data.name,
    messages: ask.data.prompt || undefined,
    goal_type: ask.data.static ? "ask" : "ask_generative",
    value_type: goalValueTypes[ask.data.field.type] ?? "custom",
    validation_prompt: ask.data.field.description,
    choices:
      ask.data.field.type === "enum"
        ? ask.data.field.enum?.filter(Boolean).map((name) => ({ name }))
        : undefined,
    transitions: ask.data.exits.map((exit) => ({
      name: exit.name,
      target: resolveTransitionTarget(flow, ask.id, exit.name) || undefined,
      conditions: exit.conditions,
      acknowledge: exit.acknowledge,
    })),
    tools: ask.data.tools || undefined,
  }),
  subagent: (node, flow) => ({
    name: toFieldName(node.data.name),
    goal_type: "say_generative",
    messages: node.data.prompt || undefined,
    repeat: true,
    transitions: node.data.exits.map((exit) => ({
      name: exit.name,
      prompt: exit.prompt,
      target: resolveTransitionTarget(flow, node.id, exit.name) || undefined,
    })),
    tools: node.data.tools || undefined,
  }),
  newcall: (node) => ({
    name: toFieldName(node.data.name),
    goal_type: node.data.static ? "say" : "say_generative",
    messages: node.data.prompt || undefined,
    uninterruptible: true,
    fulfillment: [
      {
        timing: "triggered_once",
        new_call: {
          agent: node.data.agent,
          from_number: "{phone}",
          phone_number: node.data.phoneNumber,
          pre_merge_message: node.data.preMergeMessage || undefined,
          parent_fail_message: node.data.parentFailMessage || undefined,
          contact_name: "{%company_name%}",
          check_dnc_registry: false,
          metadata: {
            client_contact_name: "{contact_name}",
            client_contact_full_name: "{contact_full_name}",
            client_phone: "{phone}",
            brief: node.data.brief || undefined,
          },
          idle_messages: node.data.idleMessages,
        },
      },
      {
        timing: "performed",
        call_result: "converted",
      },
    ],
  }),
  hangup: (node) => ({
    name: toFieldName(node.data.name),
    goal_type: "say",
    messages: node.data.prompt || undefined,
    fulfillment: [
      {
        timing: "performed",
        voice_action: "hang_up",
        call_result: node.data.callResult || undefined,
      },
    ],
  }),
};

const goalToNodeByNodeType: {
  [NT in GoalNodeType]: (
    id: string,
    goal: NodeTypeToGoal[NT],
  ) => Extract<FlowNode, { type: NT }>;
} = {
  say: (id, goal) => ({
    id,
    type: "say",
    data: {
      name: goal.display_name ?? goal.name,
      static: goal.goal_type === "say",
      prompt: firstMessage(goal.messages),
      waitForResponse: goal.appended !== true,
    },
    position: { x: 0, y: 0 },
  }),
  ask: (id, goal) => ({
    id,
    type: "ask",
    data: {
      name: goal.display_name ?? goal.name,
      static: goal.goal_type === "ask",
      prompt: firstMessage(goal.messages),
      field: askField(goal),
      exits:
        goal.transitions.length > 0
          ? goal.transitions.map((transition) => ({
              name: transition.name ?? "",
              conditions: transition.conditions,
              acknowledge: transition.acknowledge,
            }))
          : [{ name: "" }],
      tools: goal.tools ?? [],
    },
    position: { x: 0, y: 0 },
  }),
  subagent: (id, goal) => ({
    id,
    type: "subagent",
    data: {
      name: goal.name,
      prompt: firstMessage(goal.messages),
      exits: goal.transitions.map(({ name, prompt }) => ({
        name,
        prompt,
      })),
      tools: goal.tools ?? [],
    },
    position: { x: 0, y: 0 },
  }),
  newcall: (id, goal) => {
    const call = goal.fulfillment[0].new_call;
    return {
      id,
      type: "newcall",
      data: {
        name: goal.name,
        static: goal.goal_type === "say",
        prompt: firstMessage(goal.messages),
        agent: call.agent,
        phoneNumber: call.phone_number,
        preMergeMessage: call.pre_merge_message,
        parentFailMessage: call.parent_fail_message,
        brief: call.metadata.brief,
        idleMessages: call.idle_messages ?? [],
      },
      position: { x: 0, y: 0 },
    };
  },
  hangup: (id, goal) => ({
    id,
    type: "hangup",
    data: {
      name: goal.name,
      prompt: firstMessage(goal.messages),
      callResult: goal.fulfillment[0].call_result,
    },
    position: { x: 0, y: 0 },
  }),
};

export function goalNodeType(goal: Goal): GoalNodeType {
  if (
    "fulfillment" in goal &&
    goal.fulfillment[0] &&
    "voice_action" in goal.fulfillment[0] &&
    goal.fulfillment[0].voice_action === "hang_up"
  ) {
    return "hangup";
  }

  if (
    "fulfillment" in goal &&
    goal.fulfillment[0] &&
    "new_call" in goal.fulfillment[0]
  ) {
    return "newcall";
  }

  if (goal.goal_type === "say_generative" && "repeat" in goal && goal.repeat) {
    return "subagent";
  }

  if (goal.goal_type === "ask" || goal.goal_type === "ask_generative") {
    return "ask";
  }

  return "say";
}

function resolveTransitionTarget(
  flow: FlowModel,
  sourceId: string,
  sourceHandle: string | null,
): string | undefined {
  const exitNodeIds = new Set(
    flow.nodes.filter((node) => node.type === "exit").map((node) => node.id),
  );
  const goalNameById = new Map(
    flow.nodes
      .filter((node) => isGoalNode(node))
      .map((node) => [node.id, toFieldName(node.data.name)]),
  );

  return flow.edges.flatMap((edge) => {
    if (
      edge.source !== sourceId ||
      (edge.sourceHandle ?? null) !== sourceHandle ||
      exitNodeIds.has(edge.target)
    ) {
      return [];
    }

    if (edge.target === SCHEDULE_CALLBACK_NODE_ID) {
      return ["schedule-callback"];
    }

    const target = goalNameById.get(edge.target);
    return target ? [target] : [];
  })[0];
}

export function goalToNode(id: string, goal: Goal): FlowNode {
  const convert = goalToNodeByNodeType[goalNodeType(goal)];
  if (convert === null)
    throw new Error("goalToNode: unsupported goal node type");
  return convert(id, goal as any);
}

export function isGoalNode(node: FlowNode): node is GoalNode {
  return node.type in nodeToGoalByNodeType;
}

export function nodeToGoal(node: FlowNode, flow: FlowModel): Goal | null {
  return isGoalNode(node)
    ? nodeToGoalByNodeType[node.type](node as any, flow)
    : null;
}

export function toFieldName(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_']+/g, "-")
    .replace(/-+/g, "-");
  return slug.replace(/^-+|-+$/g, "");
}

function firstMessage(messages: GoalMessages | undefined): string {
  return (
    (Array.isArray(messages)
      ? typeof messages[0] === "string"
        ? messages[0]
        : messages[0].message
      : messages) || ""
  );
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
