import type { InputHTMLAttributes } from "react";

import { cn } from "../lib/utils";

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
      onChange={(event) => onChange(event.target.value)}
      onBlur={(event) => onChange(sanitizeGoalName(event.currentTarget.value))}
      pattern="^[A-Za-z0-9 _'\-]*$"
      placeholder="goal-name"
      spellCheck={false}
      className={cn(
        "w-full rounded-md px-2 text-base/loose font-medium decoration-blue-500 decoration-dotted underline-offset-8 outline-none hover:not-focus:bg-slate-100 focus:underline",
        className,
      )}
      {...props}
    />
  );
}

function sanitizeGoalName(value: string): string {
  return value.trim().replace(/\s{2,}/g, " ");
}
