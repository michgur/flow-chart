import { layoutNodes } from "../auto-layout";
import type {
  AskGoal,
  Goal,
  HangupGoal,
  NewCallGoal,
  SayGoal,
  Script,
  SubagentGoal,
} from "../data-model";
import {
  generateTransitionEdgeId,
  INTRO_BUSY_SOURCE_HANDLE_ID,
  INTRO_NODE_ID,
  SCHEDULE_CALLBACK_NODE_ID,
  type FlowEdge,
  type FlowModel,
  type FlowNode,
  type IntroNodeData,
} from "../flow-model";
import { syncExits } from "../sync-exits";
import { goalNodeType, goalToNode, isGoalNode, nodeToGoal } from "./goals";

const introMetadataKeys = {
  agentName: "%agent_name%",
  companyName: "%company_name%",
  callIntro: "%call_intro%",
  inboundWelcome: "%inbound_welcome_message%",
  voicemail: "%voicemail_message%",
  speakerVerificationAcknowledge: "%speaker_verification_acknowledge%",
} as const;

const introMetadataKeySet = new Set<string>(Object.values(introMetadataKeys));
const SCHEDULE_CALLBACK_TARGET = "schedule-callback";

function sanitizeGoal(raw: Record<string, unknown>): Goal {
  if (
    Array.isArray(raw.fulfillment) &&
    raw.fulfillment[0] &&
    "voice_action" in (raw.fulfillment[0] as Record<string, unknown>) &&
    (raw.fulfillment[0] as { voice_action?: unknown }).voice_action === "hang_up"
  ) {
    return raw as HangupGoal;
  }

  if (
    Array.isArray(raw.fulfillment) &&
    raw.fulfillment[0] &&
    "new_call" in (raw.fulfillment[0] as Record<string, unknown>)
  ) {
    return raw as NewCallGoal;
  }

  const goalType = typeof raw.goal_type === "string" ? raw.goal_type : "ask";
  if (goalType === "say_generative" && raw.repeat) {
    return {
      ...raw,
      transitions: raw.transitions ?? [],
    } as SubagentGoal;
  }
  if (["ask", "ask_generative"].includes(goalType)) {
    return { ...raw, transitions: raw.transitions ?? [] } as AskGoal;
  }
  return { ...raw, transitions: raw.transitions ?? [] } as SayGoal;
}

export function sanitizeScript(raw: unknown): Script {
  if (typeof raw !== "object") return { goals: [] };
  const obj = raw as Record<string, unknown>;

  const goals = (Array.isArray(obj.goals) ? obj.goals : [])
    .filter((goal): goal is Record<string, unknown> => typeof goal === "object")
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

export function scriptToFlow(script: Script): FlowModel {
  const introData = toIntroNodeData(script.default_metadata);
  const goals = script.goals.map((goal, index) => ({
    id: `goal:${index}`,
    goal,
  }));
  const idByName = new Map(goals.map(({ id, goal }) => [goal.name, id]));
  const edges: FlowEdge[] = goals.flatMap(({ id, goal }) =>
    ("transitions" in goal ? goal.transitions : []).flatMap((transition) => {
      const target =
        transition.target === SCHEDULE_CALLBACK_TARGET
          ? SCHEDULE_CALLBACK_NODE_ID
          : transition.target !== undefined
            ? idByName.get(transition.target)
            : undefined;
      return target
        ? [
            {
              id: generateTransitionEdgeId(),
              source: id,
              sourceHandle: goalNodeType(goal) === "say" ? null : (transition.name ?? ""),
              target,
            },
          ]
        : [];
    }),
  );
  edges.unshift({
    id: generateTransitionEdgeId(),
    source: INTRO_NODE_ID,
    sourceHandle: INTRO_BUSY_SOURCE_HANDLE_ID,
    target: SCHEDULE_CALLBACK_NODE_ID,
    label: "Contact is Busy",
    deletable: false,
    selectable: false,
    focusable: false,
    reconnectable: false,
  });
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
  const scheduleCallbackNode: FlowNode = {
    id: SCHEDULE_CALLBACK_NODE_ID,
    type: "schedule-callback",
    data: {},
    position: { x: 0, y: 0 },
    deletable: false,
  };

  const nodes = goals.map<FlowNode>(({ id, goal }) => goalToNode(id, goal));

  const flow = syncExits({
    nodes: [introNode, scheduleCallbackNode, ...nodes],
    edges,
  });
  return {
    nodes: layoutNodes(flow.nodes, flow.edges),
    edges,
  };
}

export function flowToScript(flow: FlowModel): Script {
  const introNode = flow.nodes.find((node) => node.type === "intro");
  const nodes = flow.nodes.filter(isGoalNode);
  const exitIds = new Set(flow.nodes.filter((node) => node.type === "exit").map((node) => node.id));

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
          const firstIndex = nodes.findIndex((node) => node.id === introTargetId);
          if (firstIndex <= 0) return nodes;
          const firstNode = nodes[firstIndex];
          if (!firstNode) return nodes;
          return [firstNode, ...nodes.filter((node) => node.id !== introTargetId)];
        })();

  const defaultMetadata = introNode ? fromIntroNodeData(introNode.data) : undefined;

  return {
    goals: sortedNodes.flatMap((node) => {
      const goal = nodeToGoal(node, flow);
      return goal ? [goal] : [];
    }),
    default_metadata: defaultMetadata,
  };
}

function toIntroNodeData(defaultMetadata: Script["default_metadata"]): IntroNodeData {
  const metadata =
    defaultMetadata && typeof defaultMetadata === "object"
      ? (defaultMetadata as Record<string, unknown>)
      : {};
  const agentName = metadata[introMetadataKeys.agentName];
  const companyName = metadata[introMetadataKeys.companyName];
  const callIntro = metadata[introMetadataKeys.callIntro];
  const inboundWelcome = metadata[introMetadataKeys.inboundWelcome];
  const voicemail = metadata[introMetadataKeys.voicemail];
  const speakerVerificationAcknowledge = metadata[introMetadataKeys.speakerVerificationAcknowledge];

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
      typeof speakerVerificationAcknowledge === "string" ? speakerVerificationAcknowledge : "",
    metadataRest: rest,
  };
}

function fromIntroNodeData(data: IntroNodeData): Script["default_metadata"] | undefined {
  const metadata: Record<string, unknown> = { ...data.metadataRest };

  if (data.agentName) metadata[introMetadataKeys.agentName] = data.agentName;
  if (data.companyName) metadata[introMetadataKeys.companyName] = data.companyName;
  if (data.callIntro) metadata[introMetadataKeys.callIntro] = data.callIntro;
  if (data.inboundWelcome) metadata[introMetadataKeys.inboundWelcome] = data.inboundWelcome;
  if (data.voicemail) metadata[introMetadataKeys.voicemail] = data.voicemail;
  if (data.speakerVerificationAcknowledge) {
    metadata[introMetadataKeys.speakerVerificationAcknowledge] =
      data.speakerVerificationAcknowledge;
  }

  return Object.keys(metadata).length > 0 ? (metadata as Script["default_metadata"]) : undefined;
}
