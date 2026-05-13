import type { NewCallConfig, ToolConfig, ToolValues } from "../../data-model";

export type ToolParameterSchema = {
  type?: string;
  description?: string;
  enum?: string[];
};

export type EntryRow = {
  id: string;
  key: string;
  value: string;
};

export const PARAMETER_TYPES = [
  "string",
  "number",
  "boolean",
  "integer",
  "object",
  "array",
] as const;

export const WEBHOOK_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export function createEmptyTool(): ToolConfig {
  return {
    name: "",
    enabled: true,
    description: "",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    fulfillment: {},
  };
}

export function normalizeParameters(
  parameters: ToolConfig["parameters"] | undefined,
): ToolConfig["parameters"] {
  return {
    type: "object",
    properties: parameters?.properties ?? {},
    required: parameters?.required ?? [],
  };
}

export function normalizeNewCallConfig(config: NewCallConfig | undefined): NewCallConfig {
  const fallback = createDefaultNewCallConfig();
  if (!config) return fallback;

  return {
    ...fallback,
    ...config,
    metadata: {
      ...fallback.metadata,
      ...config.metadata,
    },
  };
}

function createDefaultNewCallConfig(): NewCallConfig {
  return {
    agent: "",
    from_number: "{phone}",
    phone_number: "",
    contact_name: "{%company_name%}",
    check_dnc_registry: false,
    metadata: {
      client_contact_name: "{contact_name}",
      client_contact_full_name: "{contact_full_name}",
      client_phone: "{phone}",
    },
  };
}

export function uniqueName(base: string, usedNames: Set<string>): string {
  let index = 1;
  let name = `${base}_${index}`;
  while (usedNames.has(name)) {
    index += 1;
    name = `${base}_${index}`;
  }
  return name;
}

export function removeToolResult(values: ToolValues | undefined): Record<string, unknown> {
  if (!values) return {};
  const rest = { ...values };
  delete rest.tool_result;
  return rest;
}

export function isEmptyObject(value: Record<string, unknown>): boolean {
  return Object.keys(value).length === 0;
}

export function entriesToRows(value: Record<string, unknown>): EntryRow[] {
  return Object.entries(value).map(([key, entryValue]) => ({
    id: crypto.randomUUID(),
    key,
    value: toInlineValue(entryValue),
  }));
}

export function rowsToEntries(rows: EntryRow[]): Record<string, unknown> {
  return Object.fromEntries(
    rows
      .map((row) => [row.key.trim(), parseInlineValue(row.value)] as const)
      .filter(([key]) => Boolean(key)),
  );
}

function toInlineValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value) ?? "null";
}

function parseInlineValue(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const shouldAttemptJson =
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed.startsWith('"') ||
    /^(true|false|null|-?\d+(\.\d+)?)$/.test(trimmed);

  if (!shouldAttemptJson) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}
