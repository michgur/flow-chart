import type { Edge, Node } from "@xyflow/react";
import { GoalNode } from "./ui/GoalNode";

export type GoalNodeData = {
  name: string;
  messages?: string;
};
export type SayNodeData = {
  static: boolean;
  prompt: string;
  waitForResponse: boolean;
};
export type AskNodeData = {};

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
