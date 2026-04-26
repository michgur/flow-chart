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
  conditions?: string;
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
};

export type GoalNode = Node<GoalNodeData, "goal">;
export type SayNode = Node<SayNodeData, "say">;
export type AskNode = Node<AskNodeData, "ask">;
export type FlowNode = GoalNode | SayNode | AskNode;

export type TransitionEdgeData = {
  kind: "transition";
  name: string;
  conditions?: string;
  prompt?: string;
};
export type FlowEdge = Edge<TransitionEdgeData>;

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

export function goalDisplayName(goalName: string): string {
  return (
    goalName
      .split("-")
      .filter((segment) => segment.length > 0)
      .map((segment) => `${segment[0].toUpperCase()}${segment.slice(1)}`)
      .join(" ") || "Untitled goal"
  );
}
