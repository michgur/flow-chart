import { useMemo } from "react";

import { getLastToken } from "../lib/conditions";
import { useScriptVariables } from "./use-script-variables";

const logicalOperators = ["and", "or"];
const operators = [
  "=",
  "!=",
  "<",
  ">",
  "<=",
  ">=",
  "<>",
  "><",
  "$contains",
  "$not_contains",
  "$empty",
  "$any",
  "$is_empty",
  "$performed",
  "$not_performed",
  "$completed",
  "$not_completed",
  "$triggered",
  "$not_triggered",
  "$date_valid",
  "$date_diff_eq",
  "$date_diff_gt",
  "$date_diff_gte",
  "$date_diff_lt",
  "$date_diff_lte",
];

export type ConditionsSuggestion = {
  value: string;
  label: string;
};

export function useConditionsSuggestions(
  conditions: string,
  defaultSuggestions?: ConditionsSuggestion[],
) {
  const { vars } = useScriptVariables();

  return useMemo<ConditionsSuggestion[]>(() => {
    if (conditions.length === 0 && defaultSuggestions) return defaultSuggestions;

    const { type, content } = getLastToken(conditions);
    let sugg =
      type === "variable"
        ? vars
        : type === "operator"
          ? operators
          : type === "logical operator"
            ? logicalOperators
            : [];
    const query = content.toLowerCase().trim();
    if (query.length > 0) sugg = sugg.filter((value) => value.toLowerCase().startsWith(query));
    return sugg.map((value) => ({ value, label: value }));
  }, [conditions, vars, defaultSuggestions]);
}
