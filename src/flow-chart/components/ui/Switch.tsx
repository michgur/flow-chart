import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "../../lib/utils";

type SwitchProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
};

export function Switch({ label, value, onChange, className }: SwitchProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-2 text-slate-600 select-none hover:bg-slate-100",
        className,
      )}
    >
      <span>{label}</span>
      <BaseSwitch.Root
        checked={value}
        onCheckedChange={onChange}
        className="relative h-5 w-9 shrink-0 rounded-full bg-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 active:scale-95 data-checked:bg-slate-800"
      >
        <BaseSwitch.Thumb className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-xs transition-transform data-checked:translate-x-4" />
      </BaseSwitch.Root>
    </label>
  );
}
