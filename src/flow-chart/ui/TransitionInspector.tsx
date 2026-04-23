import { useCallback } from "react";
import { goalDisplayName } from "../adapter";
import type { Transition, TransitionId } from "../data-model";
import { useScript, useScriptStore } from "../hooks/use-script";
import { getGoal, getTransition, updateTransition } from "../script-actions";
import { GoalNameInput } from "./GoalNameInput";
import { ArrowRightIcon } from "@phosphor-icons/react";

export function TransitionInspector({
  transitionId,
}: {
  transitionId: TransitionId;
}) {
  const transition = useScript((script) => getTransition(script, transitionId));
  const store = useScriptStore();

  const update = useCallback(
    (change: Partial<Transition>) =>
      store.set((script) => updateTransition(script, transitionId, change)),
    [transitionId],
  );

  const source = useScript((script) =>
    transitionId.source ? getGoal(script, transitionId.source) : undefined,
  );
  const target = useScript((script) => getGoal(script, transitionId.target));

  console.log(transitionId, transition);
  if (!transition) return null;
  const hasPrompt = transition.prompt !== undefined;
  return (
    <section className="space-y-2 px-2 py-4">
      <h3 className="flex items-center gap-1 px-2 text-base font-medium text-slate-700">
        <span>
          {source ? goalDisplayName(source.name) : "Global transition"}
        </span>
        <ArrowRightIcon weight="bold" />
        <span>{goalDisplayName(target?.name ?? "")}</span>
      </h3>

      <GoalNameInput
        value={transition.name}
        onChange={(name) => update({ name })}
        placeholder="transition-name"
      />

      <label className="block space-y-1">
        <span className="text-slate-500">Type</span>
        <select
          value={hasPrompt ? "prompt" : "conditions"}
          onChange={(e) =>
            update(
              e.target.value === "prompt"
                ? { prompt: transition.prompt ?? "" }
                : { prompt: undefined },
            )
          }
          className="w-full rounded border border-slate-300 px-2 py-1"
        >
          <option value="conditions">conditions</option>
          <option value="prompt">prompt</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-slate-500">Conditions</span>
        <input
          value={transition.conditions ?? ""}
          onChange={(e) => update({ conditions: e.target.value || undefined })}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      </label>

      {hasPrompt && (
        <label className="block space-y-1">
          <span className="text-slate-500">Prompt</span>
          <input
            value={transition.prompt ?? ""}
            onChange={(e) => update({ prompt: e.target.value || undefined })}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        </label>
      )}
    </section>
  );
}
