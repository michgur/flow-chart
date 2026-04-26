import type { Edge, Node } from "@xyflow/react";
import { GoalNode } from "./ui/GoalNode";

export type GoalNodeData = {
  kind: "goal";
  name: string;
  messages?: string;
};
export type AskNodeData = {
  kind: "ask";
};
export type FlowNodeData = GoalNodeData | AskNodeData;

export type GoalNode = Node<GoalNodeData, "goal">;
export type AskNode = Node<AskNodeData, "ask">;
export type FlowNode = GoalNode | AskNode;

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
