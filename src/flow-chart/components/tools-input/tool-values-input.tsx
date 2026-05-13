import type { ToolValues } from "../../data-model";
import { Switch } from "../ui/Switch";
import { SimpleObjectInput } from "./simple-object-input";
import { isEmptyObject, removeToolResult } from "./tools-input-utils";

type ToolValuesInputProps = {
  value: ToolValues | undefined;
  onChange: (value: ToolValues | undefined) => void;
};

export function ToolValuesInput({ value, onChange }: ToolValuesInputProps) {
  const callStateValues = removeToolResult(value);
  const toolResultValues = value?.tool_result ?? {};
  const hasToolResult = value?.tool_result !== undefined;

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <span className="block font-medium text-slate-700">Call state values</span>
        <SimpleObjectInput
          value={callStateValues}
          onChange={(nextStateValues) => {
            const nextValue = {
              ...nextStateValues,
              ...(hasToolResult && !isEmptyObject(toolResultValues)
                ? { tool_result: toolResultValues }
                : hasToolResult
                  ? { tool_result: {} }
                  : {}),
            };
            onChange(isEmptyObject(nextValue) ? undefined : nextValue);
          }}
        />
      </div>

      <Switch
        label="Return tool_result values"
        value={hasToolResult}
        onChange={(enabled) => {
          if (!enabled) {
            onChange(isEmptyObject(callStateValues) ? undefined : callStateValues);
            return;
          }

          onChange({
            ...callStateValues,
            tool_result: toolResultValues,
          });
        }}
        className="-mx-2 px-2"
      />

      {hasToolResult && (
        <div className="space-y-1">
          <span className="block font-medium text-slate-700">tool_result values</span>
          <SimpleObjectInput
            value={toolResultValues}
            onChange={(toolResult) => {
              onChange({
                ...callStateValues,
                tool_result: toolResult,
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
