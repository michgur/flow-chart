import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "../../lib/utils";

export type ToggleOption<Value extends string> = {
  value: Value;
  label: string;
};

type ToggleGroupProps<Value extends string> = {
  value: Value;
  onChange: (value: Value) => void;
  options: readonly ToggleOption<Value>[];
  className?: string;
};

export function ToggleGroup<Value extends string>({
  value,
  onChange,
  options,
  className,
}: ToggleGroupProps<Value>) {
  return (
    <BaseToggleGroup<Value>
      value={[value]}
      onValueChange={(next) => {
        const value = next[0];
        if (value) onChange(value);
      }}
      className={cn("flex rounded-sm bg-slate-200 p-0.5", className)}
    >
      {options.map((option) => (
        <BaseToggle
          className="flex-1 cursor-pointer rounded-xs px-3 py-1 font-medium text-slate-500 outline-offset-2 outline-emerald-500 hover:text-slate-700 focus-visible:z-10 focus-visible:outline-2 active:not-data-pressed:scale-95 data-pressed:bg-slate-50 data-pressed:text-slate-700"
          key={option.value}
          value={option.value}
        >
          {option.label}
        </BaseToggle>
      ))}
    </BaseToggleGroup>
  );
}
