import { QuestionMarkIcon } from "@phosphor-icons/react";
import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

import { type AskNode, type FlowEdge } from "../../flow-model";
import { AutoResizeTextarea } from "../AutoResizeTextarea";
import { ComboboxSelect, type ComboboxSelectOption } from "../ComboboxSelect";
import { EnumInput } from "../EnumInput";
import { GoalNameInput } from "../GoalNameInput";
import { Switch } from "../Switch";
import { ToggleGroup, type ToggleOption } from "../ToggleGroup";

type AskMode = "script" | "prompt";
type FieldType = AskNode["data"]["field"]["type"];

const fieldTypeOptions = [
  { value: "boolean", label: "Boolean" },
  { value: "enum", label: "Enum" },
] satisfies ComboboxSelectOption<FieldType>[];

export function AskInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<AskNode, FlowEdge>();
  const node = useNodesData<AskNode>(id);
  const data = node?.data;

  const [prompt, setPrompt] = useState(data?.prompt ?? "");

  useEffect(() => setPrompt(data?.prompt ?? ""), [data?.prompt, id]);

  if (!data) return null;

  const mode: AskMode = data.static ? "script" : "prompt";
  const fieldName = toFieldName(data.name);
  const updateField = (field: AskNode["data"]["field"]) =>
    updateNodeData(id, { field: { ...field, name: fieldName } });
  const updateName = (name: string) =>
    updateNodeData(id, {
      name,
      field: { ...data.field, name: toFieldName(name) },
    });

  return (
    <section className="space-y-3 p-3 text-sm">
      <label htmlFor="ask-name" className="grid cursor-text grid-cols-[auto_1fr] items-center">
        <QuestionMarkIcon className="size-6" weight="duotone" />
        <GoalNameInput id="ask-name" value={data.name} onChange={updateName} />
        <span className="col-start-2 px-2 text-xs text-slate-400">
          field: {fieldName || "field-name"}
        </span>
      </label>

      <ToggleGroup
        className="w-fit text-xs"
        value={mode}
        onChange={(mode) => updateNodeData(id, { static: mode === "script" })}
        options={
          [
            { value: "script", label: "Script" },
            { value: "prompt", label: "Prompt" },
          ] satisfies ToggleOption<AskMode>[]
        }
      />

      <AutoResizeTextarea
        name="ask-prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onBlur={(event) => {
          const prompt = event.target.value;
          setPrompt(prompt);
          updateNodeData(id, { prompt });
        }}
        placeholder={
          data.static
            ? "Enter exact question for agent to ask"
            : "e.g. Ask for the user's preferred option"
        }
        className="w-full resize-none overflow-hidden text-slate-900 outline-none"
        spellCheck={true}
      />

      <label className="space-y-1">
        <span className="text-slate-500 select-none">Answer type</span>
        <ComboboxSelect
          value={data.field.type}
          onChange={(type) =>
            updateField(
              type === "boolean"
                ? { ...data.field, type, enum: undefined }
                : { ...data.field, type },
            )
          }
          options={fieldTypeOptions}
          searchPlaceholder="Search response types"
        />
      </label>

      {data.field.type === "enum" && (
        <label className="block space-y-1">
          <span className="text-slate-500 select-none">Options</span>
          <EnumInput
            value={data.field.enum ?? []}
            onChange={(options) =>
              updateField({
                ...data.field,
                enum: options.length > 0 ? options : undefined,
              })
            }
          />
        </label>
      )}

      <Switch
        label="Answer is optional"
        value={data.field.optional ?? false}
        onChange={(optional) => updateField({ ...data.field, optional: optional || undefined })}
        className="-mx-2 px-2 font-medium"
      />
    </section>
  );
}

function toFieldName(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_']+/g, "-")
    .replace(/-+/g, "-");
  return slug.replace(/^-+|-+$/g, "");
}
