import { PlusIcon, QuestionMarkIcon, TrashIcon } from "@phosphor-icons/react";
import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

import { toFieldName } from "../../adapters/goals";
import { type AskNode, type FlowEdge } from "../../flow-model";
import type { ConditionsSuggestion } from "../../hooks/use-conditions-suggestions";
import { cn } from "../../lib/utils";
import { FieldSchemaInput } from "../FieldSchemaInput";
import { GoalNameInput } from "../GoalNameInput";
import { ToolsInput } from "../ToolsInput";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { ConditionInput } from "../ui/ConditionInput";
import { ToggleGroup, type ToggleOption } from "../ui/ToggleGroup";

type AskMode = "script" | "prompt";
type Field = AskNode["data"]["field"];
type AskExit = AskNode["data"]["exits"][number];

export function AskInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<AskNode, FlowEdge>();
  const node = useNodesData<AskNode>(id);
  const data = node?.data;

  const [prompt, setPrompt] = useState(data?.prompt ?? "");
  const [exitConditions, setExitConditions] = useState<string[]>([]);

  useEffect(() => setPrompt(data?.prompt ?? ""), [data?.prompt, id]);
  useEffect(
    () => setExitConditions(data?.exits.map((e) => e.conditions ?? "") ?? []),
    [data?.exits, id],
  );

  if (!data) return null;

  const mode: AskMode = data.static ? "script" : "prompt";
  const fieldName = toFieldName(data.name);
  const updateField = (field: Field) => {
    const next = { ...field, name: fieldName };
    updateNodeData(id, { field: next });
  };
  const updateName = (name: string) =>
    updateNodeData(id, {
      name,
      field: { ...data.field, name: toFieldName(name) },
    });

  const updateExit = (index: number, exit: AskExit) => {
    updateNodeData(id, {
      exits: data.exits.map((current, i) => (i === index ? exit : current)),
    });
  };

  const removeExit = (index: number) => {
    const exits =
      data.exits.length === 1
        ? [
            {
              name: "",
            },
          ]
        : data.exits.filter((_, i) => i !== index);
    updateNodeData(id, { exits });
  };

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

      <label className="block cursor-text pb-10">
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
      </label>

      <FieldSchemaInput value={data.field} onChange={updateField} />

      <ToolsInput value={data.tools} onChange={(tools) => updateNodeData(id, { tools })} />

      <div className="space-y-2">
        <span className="mb-2 block font-medium text-slate-700 select-none">Transitions</span>

        <div className="space-y-3">
          {data.exits.map((exit, index) => (
            <div
              key={index}
              className="group rounded-sm bg-slate-100 p-2 outline-emerald-500 focus-within:bg-slate-50 focus-within:outline-2"
            >
              <div className="flex items-center gap-1">
                <input
                  value={exit.name}
                  onChange={(event) => updateExit(index, { ...exit, name: event.target.value })}
                  onBlur={(event) =>
                    updateExit(index, {
                      ...exit,
                      name: event.currentTarget.value.trim().replace(/\s{2,}/g, " ") || "",
                    })
                  }
                  autoFocus={
                    index === data.exits.length - 1 && exit.name === `Transition ${index + 1}`
                  }
                  placeholder="Transition name"
                  className="min-w-0 flex-1 rounded-sm bg-transparent px-1.5 py-1 font-medium text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeExit(index)}
                  aria-label={`Remove ${exit.name || "transition"}`}
                  className="cursor-pointer rounded-sm p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-700"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
              <ConditionInput
                name={`subagent-exit-${index}-prompt`}
                value={exitConditions[index] ?? exit.conditions ?? ""}
                onChange={(conditions) => {
                  setExitConditions((ec) => ec.map((c, i) => (i === index ? conditions : c)));
                }}
                onBlur={(event) => {
                  const conditions = event.target.value;
                  setExitConditions((ec) => ec.map((c, i) => (i === index ? conditions : c)));
                  updateExit(index, { ...exit, conditions });
                }}
                className="mt-1 w-full resize-none overflow-hidden rounded-sm bg-transparent p-0 px-1.5 py-1 text-slate-700 outline-none placeholder:text-slate-400 focus:outline-2"
                defaultSuggestions={suggestConditions(data.field)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            updateNodeData(id, {
              exits: [...data.exits, { name: "", conditions: "" }],
            })
          }
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-1 rounded-sm p-2 text-xs font-medium hover:bg-violet-100 hover:text-violet-700",
            data.exits.length === 0 && "bg-slate-100",
          )}
        >
          <PlusIcon weight="bold" className="size-3" />
          Add transition
        </button>
      </div>
    </section>
  );
}

function suggestConditions(field: Field): ConditionsSuggestion[] {
  const sugg =
    field.type === "boolean"
      ? [
          { label: "=Yes", value: `${field.name} = yes` },
          { label: "=No", value: `${field.name} = no` },
        ]
      : field.type === "enum"
        ? (field.enum?.filter(Boolean).map((option) => ({
            label: `=${option}`,
            value: `${field.name} = ${option}`,
          })) ?? [])
        : field.type === "string"
          ? [
              { label: "Any value", value: `${field.name} $any` },
              { label: "=", value: `${field.name} =` },
              { label: "!=", value: `${field.name} !=` },
              { label: "Contains", value: `${field.name} $contains` },
              { label: "Not contains", value: `${field.name} $not_contains` },
            ]
          : [
              { label: "Any value", value: `${field.name} $any` },
              { label: "=", value: `${field.name} =` },
              { label: "!=", value: `${field.name} !=` },
              { label: "<", value: `${field.name} <` },
              { label: ">", value: `${field.name} >` },
              { label: "<=", value: `${field.name} <=` },
              { label: ">=", value: `${field.name} >=` },
            ];
  return field.optional
    ? [...sugg, { label: "Refused to answer", value: `${field.name} = null` }]
    : sugg;
}
