import { useCallback, useState } from "react";
import { GoalNameInput } from "./GoalNameInput";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import { useScript, useScriptStore } from "../hooks/use-script";
import { getGoal, updateGoal } from "../script-actions";
import type { Goal } from "../data-model";

export function GoalInspector({ goalId }: { goalId: string }) {
  const goal = useScript((script) => getGoal(script, goalId));
  const [prompt, setPrompt] = useState(goal?.messages ?? "");

  const store = useScriptStore();
  const update = useCallback(
    (change: Partial<Goal>) =>
      store.set((script) => updateGoal(script, goalId, change)),
    [goalId],
  );

  if (!goal) return null;
  return (
    <section className="space-y-2 text-sm p-2">
      <GoalNameInput
        value={goal.name}
        onChange={(value) => update({ name: value })}
      />

      <label className="flex flex-col gap-2 px-2 pb-10 cursor-text">
        <span className="text-slate-500 cursor-default">Prompt</span>
        <AutoResizeTextarea
          name="goal-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onBlur={(event) => {
            setPrompt(event.target.value);
            update({ messages: event.target.value || undefined });
          }}
          placeholder="Optional prompt context"
          className="w-full resize-none overflow-hidden outline-none"
          spellCheck={true}
        />
      </label>
    </section>
  );
}
