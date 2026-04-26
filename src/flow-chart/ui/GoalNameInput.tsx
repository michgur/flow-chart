import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type GoalNameInputProps = {
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">;

export function GoalNameInput({ value, onChange, className, ...props }: GoalNameInputProps) {
  return (
    <input
      name="goal-name"
      value={value}
      autoFocus={value.length === 0}
      onChange={(event) => onChange(goalNamify(event.target.value, true))}
      onBlur={() => onChange(goalNamify(value))}
      pattern="^[a-z0-9'_]+(?:-[a-z0-9'_]+)*$"
      placeholder="goal-name"
      spellCheck={false}
      className={cn(
        "w-full px-2 hover:not-focus:bg-slate-100 focus:underline decoration-dotted decoration-blue-500 underline-offset-8 text-base/loose font-medium outline-none rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function goalNamify(value: string, allowTail = false): string {
  const trimmed = allowTail ? value.trimStart() : value.trim();
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9-_']+/g, "-")
    .replace(/-+/g, "-");
  return allowTail ? slug.replace(/^-+/, "") : slug.replace(/^-+|-+$/g, "");
}
