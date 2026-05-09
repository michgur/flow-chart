import { layoutNodes } from "./auto-layout";
import type {
  AskGoal,
  Goal,
  NewCallGoal,
  Script,
  SayGoal,
  SubagentGoal,
  GoalMessages,
} from "./data-model";
import {
  generateTransitionEdgeId,
  INTRO_NODE_ID,
  type AskNodeData,
  type FlowModel,
  type FlowNode,
  type IntroNodeData,
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

const introMetadataKeys = {
  agentName: "%agent_name%",
  companyName: "%company_name%",
  callIntro: "%call_intro%",
  inboundWelcome: "%inbound_welcome_message%",
  voicemail: "%voicemail_message%",
  speakerVerificationAcknowledge: "%speaker_verification_acknowledge%",
} as const;

const introMetadataKeySet = new Set<string>(Object.values(introMetadataKeys));

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

function sanitizeNewCall(raw: Record<string, unknown>): NewCallGoal {
  return raw as NewCallGoal;
}

function sanitizeGoal(raw: Record<string, unknown>): Goal {
  if (
    Array.isArray(raw.fulfillment) &&
    raw.fulfillment[0] &&
    "new_call" in (raw.fulfillment[0] as Record<string, unknown>)
  ) {
    return sanitizeNewCall(raw);
  }

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

  const defaultMetadata =
    obj.default_metadata && typeof obj.default_metadata === "object"
      ? (obj.default_metadata as Script["default_metadata"])
      : undefined;

  return {
    goals,
    default_metadata: defaultMetadata,
  };
}

export function scriptToFlowModel(script: Script): FlowModel {
  const introData = toIntroNodeData(script.default_metadata);
  const goals = script.goals.map((goal, index) => ({
    id: `goal:${index}`,
    goal,
  }));
  const idByName = new Map(goals.map(({ id, goal }) => [goal.name, id]));
  const edges = goals.flatMap(({ id, goal }) =>
    ("transitions" in goal ? goal.transitions : []).flatMap((transition) => {
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
  if (goals[0]) {
    edges.unshift({
      id: generateTransitionEdgeId(),
      source: INTRO_NODE_ID,
      sourceHandle: null,
      target: goals[0].id,
    });
  }

  const introNode: FlowNode = {
    id: INTRO_NODE_ID,
    type: "intro",
    data: introData,
    position: { x: 0, y: 0 },
    draggable: false,
    deletable: false,
  };

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

    if (isNewCallGoal(goal)) {
      const newCall = goal.fulfillment[0].new_call;
      return {
        id,
        type: "newcall",
        data: {
          name: goal.name,
          static: goal.goal_type === "say",
          prompt: firstMessage(goal.messages),
          agent: newCall.agent,
          phoneNumber: newCall.phone_number,
          preMergeMessage: newCall.pre_merge_message,
          parentFailMessage: newCall.parent_fail_message,
          brief: newCall.metadata.brief,
          idleMessages: newCall.idle_messages,
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
        exits:
          goal.transitions.length > 0
            ? goal.transitions.map((transition) => ({
                name: transition.name ?? "",
                conditions: transition.conditions,
                acknowledge: transition.acknowledge,
              }))
            : [{ name: "" }],
      },
      position: { x: 0, y: 0 },
    };
  });

  const flow = syncExits({ nodes: [introNode, ...nodes], edges });
  return {
    nodes: layoutNodes(flow.nodes, flow.edges),
    edges,
  };
}

export function flowModelToScript(flow: FlowModel): Script {
  const introNode = flow.nodes.find((node) => node.type === "intro");
  const nodes = flow.nodes.filter(
    (node) =>
      node.type === "say" ||
      node.type === "newcall" ||
      node.type === "ask" ||
      node.type === "subagent",
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

  const introTargetId =
    flow.edges.find(
      (edge) =>
        edge.source === INTRO_NODE_ID &&
        (edge.sourceHandle ?? null) === null &&
        !exitIds.has(edge.target),
    )?.target ?? null;

  const sortedNodes =
    introTargetId === null
      ? nodes
      : (() => {
          const firstIndex = nodes.findIndex(
            (node) => node.id === introTargetId,
          );
          if (firstIndex <= 0) return nodes;
          const firstNode = nodes[firstIndex];
          if (!firstNode) return nodes;
          return [
            firstNode,
            ...nodes.filter((node) => node.id !== introTargetId),
          ];
        })();

  const defaultMetadata = introNode
    ? fromIntroNodeData(introNode.data)
    : undefined;

  return {
    goals: sortedNodes.map<Goal>((node) => {
      const goal = {
        name: toFieldName(node.data.name),
        display_name: node.data.name,
        messages: node.data.prompt || undefined,
      };

      if (node.type === "newcall") {
        return {
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
        };
      }

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
    default_metadata: defaultMetadata,
  };
}

function toIntroNodeData(
  defaultMetadata: Script["default_metadata"],
): IntroNodeData {
  const metadata =
    defaultMetadata && typeof defaultMetadata === "object"
      ? (defaultMetadata as Record<string, unknown>)
      : {};
  const agentName = metadata[introMetadataKeys.agentName];
  const companyName = metadata[introMetadataKeys.companyName];
  const callIntro = metadata[introMetadataKeys.callIntro];
  const inboundWelcome = metadata[introMetadataKeys.inboundWelcome];
  const voicemail = metadata[introMetadataKeys.voicemail];
  const speakerVerificationAcknowledge =
    metadata[introMetadataKeys.speakerVerificationAcknowledge];

  const rest = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !introMetadataKeySet.has(key)),
  );

  return {
    agentName: typeof agentName === "string" ? agentName : "",
    companyName: typeof companyName === "string" ? companyName : "",
    callIntro: typeof callIntro === "string" ? callIntro : "",
    inboundWelcome: typeof inboundWelcome === "string" ? inboundWelcome : "",
    voicemail: typeof voicemail === "string" ? voicemail : "",
    speakerVerificationAcknowledge:
      typeof speakerVerificationAcknowledge === "string"
        ? speakerVerificationAcknowledge
        : "",
    metadataRest: rest,
  };
}

function fromIntroNodeData(
  data: IntroNodeData,
): Script["default_metadata"] | undefined {
  const metadata: Record<string, unknown> = { ...data.metadataRest };

  if (data.agentName) metadata[introMetadataKeys.agentName] = data.agentName;
  if (data.companyName)
    metadata[introMetadataKeys.companyName] = data.companyName;
  if (data.callIntro) metadata[introMetadataKeys.callIntro] = data.callIntro;
  if (data.inboundWelcome)
    metadata[introMetadataKeys.inboundWelcome] = data.inboundWelcome;
  if (data.voicemail) metadata[introMetadataKeys.voicemail] = data.voicemail;
  if (data.speakerVerificationAcknowledge) {
    metadata[introMetadataKeys.speakerVerificationAcknowledge] =
      data.speakerVerificationAcknowledge;
  }

  return Object.keys(metadata).length > 0
    ? (metadata as Script["default_metadata"])
    : undefined;
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
    !isNewCallGoal(goal) &&
    !isSubagentGoal(goal) &&
    (goal.goal_type === "say" || goal.goal_type === "say_generative")
  );
}

function isNewCallGoal(goal: Goal): goal is NewCallGoal {
  return "fulfillment" in goal && "new_call" in goal.fulfillment[0];
}

function isSubagentGoal(goal: Goal): goal is SubagentGoal {
  return goal.goal_type === "say_generative" && "repeat" in goal && goal.repeat;
}

function firstMessage(messages: GoalMessages | undefined): string {
  return Array.isArray(messages)
    ? typeof messages[0] === "string"
      ? messages[0]
      : ""
    : (messages ?? "");
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
