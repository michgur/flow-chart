import type { Edge, Node } from "@xyflow/react";

export type GoalNodeData = {
  name: string;
  messages?: string;
};
export type SayNodeData = {
  name: string;
  static: boolean;
  prompt: string;
  waitForResponse: boolean;
};

export type NodeExit = {
  name: string;
  value?: string | boolean | null;
  acknowledge?: string;
};

export type AskNodeData = {
  name: string;
  static: boolean;
  prompt: string;
  field: {
    name: string;
    type: "boolean" | "enum";
    enum?: string[];
    optional?: boolean;
  };
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

export type GoalNode = Node<GoalNodeData, "goal">;
export type SayNode = Node<SayNodeData, "say">;
export type AskNode = Node<AskNodeData, "ask">;
export type SubagentNode = Node<SubagentNodeData, "subagent">;
export type ExitNode = Node<ExitNodeData, "exit">;
export type FlowNode = GoalNode | SayNode | AskNode | SubagentNode | ExitNode;

export type FlowEdge = Edge;

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
