import type { Edge, Node } from "@xyflow/react";

export const INTRO_NODE_ID = "intro";
export const SCHEDULE_CALLBACK_NODE_ID = "schedule-callback";
export const INTRO_BUSY_SOURCE_HANDLE_ID = "contact-busy";

export type GoalNodeData = {
  name: string;
  messages?: string;
};

export type IntroNodeData = {
  agentName: string;
  companyName: string;
  callIntro: string;
  inboundWelcome: string;
  voicemail: string;
  speakerVerificationAcknowledge: string;
  metadataRest: Record<string, unknown>;
};

export type SayNodeData = {
  name: string;
  static: boolean;
  prompt: string;
  waitForResponse: boolean;
};

export type NewCallNodeData = {
  name: string;
  static: boolean;
  prompt: string;
  agent: string;
  phoneNumber: string;
  preMergeMessage?: string;
  parentFailMessage?: string;
  brief?: string;
  idleMessages: { text: string; timeout: number }[];
};

export type HangupNodeData = {
  name: string;
  prompt: string;
  callResult?: string;
};

export type ScheduleCallbackNodeData = Record<string, never>;

export type NodeExit = {
  name: string;
  /** @deprecated */
  value?: string | boolean | null;
  conditions?: string;
  acknowledge?: string;
};

export type FieldSchema = {
  name: string;
  type: "boolean" | "enum" | "string" | "number";
  enum?: string[];
  optional?: boolean;
  description?: string;
};

export type AskNodeData = {
  name: string;
  static: boolean;
  prompt: string;
  field: FieldSchema;
  exits: NodeExit[];
};

export type SubagentNodeData = {
  name: string;
  prompt: string;
  exits: {
    name: string;
    prompt: string;
  }[];
};

export type ExitNodeData = {
  name: string;
};

export type IntroNode = Node<IntroNodeData, "intro">;
export type GoalNode = Node<GoalNodeData, "goal">;
export type SayNode = Node<SayNodeData, "say">;
export type NewCallNode = Node<NewCallNodeData, "newcall">;
export type HangupNode = Node<HangupNodeData, "hangup">;
export type ScheduleCallbackNode = Node<ScheduleCallbackNodeData, "schedule-callback">;
export type AskNode = Node<AskNodeData, "ask">;
export type SubagentNode = Node<SubagentNodeData, "subagent">;
export type ExitNode = Node<ExitNodeData, "exit">;
export type FlowNode =
  | IntroNode
  | ScheduleCallbackNode
  | GoalNode
  | SayNode
  | NewCallNode
  | HangupNode
  | AskNode
  | SubagentNode
  | ExitNode;

export type FlowEdgeType = "default" | "bezier";
export type FlowEdge = Edge<Record<string, unknown>, FlowEdgeType>;

export type FlowModel = {
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export function generateGoalNodeId(): string {
  return `goal:${crypto.randomUUID()}`;
}

export function generateTransitionEdgeId(): string {
  return `edge:${crypto.randomUUID()}`;
}

export function fieldExits(field: AskNodeData["field"]): NodeExit[] {
  const exits =
    field.type === "boolean"
      ? [
          { name: "Yes", value: true },
          { name: "No", value: false },
        ]
      : (field.enum?.filter(Boolean).map((name) => ({ name, value: name })) ?? []);
  return field.optional ? [...exits, { name: "Refused to answer", value: null }] : exits;
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
