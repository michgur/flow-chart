import { useEffect, useState } from "react";
import {
  sanitizeGoalNameInput,
  sanitizeGoalNameWhileEditing,
} from "../goal-name";
import { cn } from "../../lib/utils";

type GoalNameInputProps = {
  value: string;
  onChange: (nextGoalName: string) => void;
  className?: string;
};

export function GoalNameInput({
  value,
  onChange,
  className,
}: GoalNameInputProps) {
  const [inputValue, setInputValue] = useState(() =>
    sanitizeGoalNameWhileEditing(value),
  );

  useEffect(() => {
    const sanitizedValue = sanitizeGoalNameInput(value);
    const nextInputValue =
      value === sanitizedValue
        ? sanitizeGoalNameWhileEditing(value)
        : sanitizedValue;

    setInputValue(nextInputValue);

    if (value !== sanitizedValue) {
      onChange(sanitizedValue);
    }
  }, [value, onChange]);

  return (
    <input
      name="goal-name"
      value={inputValue}
      autoFocus={inputValue.startsWith("goal")}
      onChange={(event) =>
        setInputValue(sanitizeGoalNameWhileEditing(event.target.value))
      }
      onBlur={() => {
        const sanitizedValue = sanitizeGoalNameInput(inputValue);
        setInputValue(sanitizedValue);
        onChange(sanitizedValue);
      }}
      placeholder="goal-name"
      spellCheck={false}
      className={cn(
        "w-full px-2 hover:not-focus:bg-slate-100 focus:underline decoration-dotted decoration-blue-500 underline-offset-8 text-base/loose font-medium outline-none rounded-md",
        className,
      )}
    />
  );
}
