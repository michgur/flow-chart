import { useCallback, useEffect, useState } from "react";
import type { Goal } from "../data-model";
import { GoalNameInput } from "./GoalName";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

type GoalInspectorProps = {
  value: Goal;
  onChange: (nextGoal: Goal) => void;
};

export function GoalInspector({ value, onChange }: GoalInspectorProps) {
  const [messagesInput, setMessagesInput] = useState(value.messages ?? "");

  useEffect(() => {
    setMessagesInput(value.messages ?? "");
  }, [value.messages, value.name]);

  const onNameChange = useCallback(
    (nextGoalName: string) => {
      onChange({ ...value, name: nextGoalName });
    },
    [onChange, value],
  );

  const onMessagesBlur = useCallback(
    (nextGoalMessages: string) => {
      if ((value.messages ?? "") === nextGoalMessages) {
        return;
      }

      onChange({ ...value, messages: nextGoalMessages });
    },
    [onChange, value],
  );

  return (
    <section className="space-y-2 text-sm p-2">
      <GoalNameInput value={value.name} onChange={onNameChange} />

      <label className="flex flex-col gap-2 px-2">
        <span className="text-slate-500">Prompt</span>
        <AutoResizeTextarea
          name="goal-prompt"
          value={messagesInput}
          onChange={(event) => setMessagesInput(event.target.value)}
          onBlur={(event) => onMessagesBlur(event.target.value)}
          placeholder="Optional prompt context"
          className="w-full resize-none overflow-hidden outline-none"
          spellCheck={true}
        />
      </label>
    </section>
  );
}
