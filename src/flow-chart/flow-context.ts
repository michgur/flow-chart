import { createContext, useContext } from "react";
import type { GoalName } from "./data-model";

export const FlowContext = createContext<{
  createGoal?: (from: GoalName) => void;
}>({});

export function useFlowContext() {
  return useContext(FlowContext);
}
