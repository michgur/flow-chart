import type { GoalName, Script } from "./data-model";

const GOAL_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const GOAL_NAME_PATTERN = "^[a-z0-9]+(?:-[a-z0-9]+)*$";

export function sanitizeGoalNameWhileEditing(value: string): string {
  return value
    .toLowerCase()
    .trimStart()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-{2,}$/g, "-");
}

export function sanitizeGoalNameInput(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidGoalName(value: string): value is GoalName {
  return GOAL_NAME_REGEX.test(value);
}

export function goalNameToDisplayName(goalName: string): string {
  return goalName
    .split("-")
    .filter((segment) => segment.length > 0)
    .map((segment) => `${segment[0]?.toUpperCase() ?? ""}${segment.slice(1)}`)
    .join(" ");
}

export function createGoalName(script: Script, baseName = "goal"): GoalName {
  const names = new Set(script.goals.map((goal) => goal.name));
  const normalizedBaseName = sanitizeGoalNameInput(baseName);
  const fallbackBaseName = isValidGoalName(normalizedBaseName) ? normalizedBaseName : "goal";

  if (!names.has(fallbackBaseName)) {
    return fallbackBaseName;
  }

  let suffix = 2;

  while (names.has(`${fallbackBaseName}-${suffix}`)) {
    suffix += 1;
  }

  return `${fallbackBaseName}-${suffix}`;
}
