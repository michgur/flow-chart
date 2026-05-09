import type { FieldSchema } from "../flow-model";
import { AutoResizeTextarea } from "./ui/AutoResizeTextarea";
import { ComboboxSelect, type ComboboxSelectOption } from "./ui/ComboboxSelect";
import { EnumInput } from "./ui/EnumInput";
import { Switch } from "./ui/Switch";

const fieldTypeOptions = [
  { value: "boolean", label: "Yes / No" },
  { value: "enum", label: "Choice" },
  { value: "string", label: "Text" },
  { value: "number", label: "Number" },
] satisfies ComboboxSelectOption<FieldSchema["type"]>[];

type FieldSchemaInputProps = {
  value: FieldSchema;
  onChange: (field: FieldSchema) => void;
};

export function FieldSchemaInput({ value, onChange }: FieldSchemaInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="space-y-1">
        <span className="font-medium select-none">Answer type</span>
        <ComboboxSelect
          value={value.type}
          onChange={(type) =>
            onChange(
              type === "enum"
                ? { ...value, type, description: undefined }
                : type === "string"
                  ? { ...value, type, enum: undefined }
                  : { ...value, type, enum: undefined, description: undefined },
            )
          }
          options={fieldTypeOptions}
          searchPlaceholder="Search response types"
        />
      </label>

      {value.type === "enum" && (
        <label className="block space-y-1">
          <span className="font-medium select-none">Choices</span>
          <EnumInput
            value={value.enum ?? []}
            onChange={(options) =>
              onChange({
                ...value,
                enum: options.length > 0 ? options : undefined,
              })
            }
          />
        </label>
      )}

      {value.type === "string" && (
        <label className="block cursor-text space-y-1">
          <span className="font-medium select-none">Description</span>
          <AutoResizeTextarea
            name="ask-field-description"
            value={value.description ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                description: event.target.value || undefined,
              })
            }
            placeholder="Describe what answer this field expects"
            className="w-full resize-none overflow-hidden rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 placeholder:text-slate-400 focus-within:bg-slate-50 focus-within:outline-2"
            spellCheck={true}
          />
        </label>
      )}

      <Switch
        label="Optional"
        value={value.optional ?? false}
        onChange={(optional) => onChange({ ...value, optional: optional || undefined })}
        className="-mx-2 px-2 font-medium"
      />
    </div>
  );
}
