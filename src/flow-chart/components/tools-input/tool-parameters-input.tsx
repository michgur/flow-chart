import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import type { ToolConfig } from "../../data-model";
import { cn } from "../../lib/utils";
import { EnumInput } from "../ui/EnumInput";
import { Switch } from "../ui/Switch";
import { JsonFallbackInput } from "./json-fallback-input";
import { PARAMETER_TYPES, type ToolParameterSchema, uniqueName } from "./tools-input-utils";

type ToolParametersInputProps = {
  value: ToolConfig["parameters"];
  onChange: (value: ToolConfig["parameters"]) => void;
};

export function ToolParametersInput({ value, onChange }: ToolParametersInputProps) {
  const parameterNames = Object.keys(value.properties ?? {});

  const addParameter = () => {
    const name = uniqueName("param", new Set(parameterNames));
    onChange({
      ...value,
      properties: {
        ...value.properties,
        [name]: { type: "string" },
      },
    });
  };

  const removeParameter = (name: string) => {
    const nextProperties = { ...value.properties };
    delete nextProperties[name];

    onChange({
      ...value,
      properties: nextProperties,
      required: value.required.filter((field) => field !== name),
    });
  };

  const renameParameter = (name: string, nextName: string) => {
    const normalized = nextName.trim();
    if (!normalized || normalized === name || value.properties[normalized] !== undefined) return;

    const schema = value.properties[name];
    const nextProperties = Object.fromEntries(
      Object.entries(value.properties).map(([current, currentSchema]) => {
        if (current !== name) return [current, currentSchema];
        return [normalized, currentSchema];
      }),
    );

    const nextRequired = value.required.map((field) => (field === name ? normalized : field));

    onChange({
      ...value,
      properties: schema ? nextProperties : value.properties,
      required: nextRequired,
    });
  };

  const updateParameter = (name: string, patch: ToolParameterSchema) => {
    onChange({
      ...value,
      properties: {
        ...value.properties,
        [name]: {
          ...(value.properties[name] as ToolParameterSchema),
          ...patch,
        },
      },
    });
  };

  const setRequired = (name: string, required: boolean) => {
    onChange({
      ...value,
      required: required
        ? Array.from(new Set([...value.required, name]))
        : value.required.filter((field) => field !== name),
    });
  };

  return (
    <div className="space-y-2">
      {parameterNames.length > 0 && (
        <div className="space-y-2 rounded-sm border border-slate-200 bg-white/70 p-2">
          {parameterNames.map((name) => {
            const schema = (value.properties[name] as ToolParameterSchema) ?? { type: "string" };
            return (
              <ParameterRow
                key={name}
                name={name}
                schema={schema}
                required={value.required.includes(name)}
                onRename={(nextName) => renameParameter(name, nextName)}
                onSchemaChange={(patch) => updateParameter(name, patch)}
                onRequiredChange={(required) => setRequired(name, required)}
                onRemove={() => removeParameter(name)}
              />
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={addParameter}
        className={cn(
          "flex w-full cursor-pointer items-center justify-center gap-1 rounded-sm p-2 text-xs font-medium hover:bg-violet-100 hover:text-violet-700",
          parameterNames.length === 0 && "bg-white/70",
        )}
      >
        <PlusIcon weight="bold" className="size-3" />
        Add parameter
      </button>

      <JsonFallbackInput
        title="Parameter properties JSON"
        value={value.properties}
        onChange={(properties) => onChange({ ...value, properties })}
      />
    </div>
  );
}

type ParameterRowProps = {
  name: string;
  schema: ToolParameterSchema;
  required: boolean;
  onRename: (name: string) => void;
  onSchemaChange: (schema: ToolParameterSchema) => void;
  onRequiredChange: (required: boolean) => void;
  onRemove: () => void;
};

function ParameterRow({
  name,
  schema,
  required,
  onRename,
  onSchemaChange,
  onRequiredChange,
  onRemove,
}: ParameterRowProps) {
  const [draftName, setDraftName] = useState(name);

  useEffect(() => setDraftName(name), [name]);

  const type = typeof schema.type === "string" ? schema.type : "string";
  const description = typeof schema.description === "string" ? schema.description : "";
  const enumValues = Array.isArray(schema.enum)
    ? schema.enum.filter((option): option is string => typeof option === "string")
    : [];

  return (
    <div className="space-y-2 rounded-sm bg-slate-100 p-2 outline-emerald-500 focus-within:bg-slate-50 focus-within:outline-2">
      <div className="flex items-center gap-2">
        <input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onBlur={(event) => {
            const nextName = event.target.value.trim();
            if (!nextName) {
              setDraftName(name);
              return;
            }
            onRename(nextName);
          }}
          placeholder="Parameter name"
          className="min-w-0 flex-1 rounded-sm bg-white/70 px-2 py-1.5 text-slate-900 outline-emerald-500 focus:outline-2"
        />

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="cursor-pointer rounded-sm p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-700"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="font-medium text-slate-700">Type</span>
          <select
            value={type}
            onChange={(event) => {
              const nextType = event.target.value;
              onSchemaChange(
                nextType === "string"
                  ? {
                      ...schema,
                      type: nextType,
                    }
                  : {
                      ...schema,
                      type: nextType,
                      enum: undefined,
                    },
              );
            }}
            className="w-full rounded-sm bg-white/70 px-2 py-1.5 text-slate-900 outline-emerald-500 focus:bg-white focus:outline-2"
          >
            {PARAMETER_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <Switch
          label="Required"
          value={required}
          onChange={onRequiredChange}
          className="self-end"
        />
      </div>

      <label className="block space-y-1">
        <span className="font-medium text-slate-700">Description</span>
        <input
          value={description}
          onChange={(event) =>
            onSchemaChange({
              ...schema,
              description: event.target.value || undefined,
            })
          }
          placeholder="Describe this parameter"
          className="w-full rounded-sm bg-white/70 px-2 py-1.5 text-slate-900 outline-emerald-500 focus:bg-white focus:outline-2"
        />
      </label>

      {type === "string" && (
        <label className="block space-y-1">
          <span className="font-medium text-slate-700">Enum options</span>
          <EnumInput
            value={enumValues}
            onChange={(options) =>
              onSchemaChange({ ...schema, enum: options.length ? options : undefined })
            }
            placeholder="Type option, press ⏎"
          />
        </label>
      )}
    </div>
  );
}
