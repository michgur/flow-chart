import { useEffect, useState } from "react";
import type { Transition } from "../data-model";
import type { TransitionRecord } from "../script-ops";
import { GoalNameInput } from "./GoalName";
import { ArrowRightIcon } from "@phosphor-icons/react";

type TransitionInspectorProps = {
  value: TransitionRecord;
  onChange: (nextTransition: Transition) => void;
};

export function TransitionInspector({
  value,
  onChange,
}: TransitionInspectorProps) {
  const [nameInput, setNameInput] = useState("");
  const [modeInput, setModeInput] = useState<"conditions" | "prompt">(
    "conditions",
  );
  const [conditionsInput, setConditionsInput] = useState("");
  const [promptInput, setPromptInput] = useState("");

  useEffect(() => {
    const { transition } = value;
    const prompt = (transition as { prompt?: string }).prompt;

    setNameInput(transition.name);

    if (prompt !== undefined) {
      setModeInput("prompt");
      setPromptInput(prompt);
      setConditionsInput(transition.conditions ?? "");
      return;
    }

    setModeInput("conditions");
    setConditionsInput(transition.conditions ?? "");
    setPromptInput("");
  }, [value]);

  const transitionSource =
    value.ref.kind === "goal" ? value.ref.goalName : "Global transitions";

  return (
    <section className="space-y-2 px-2 py-4">
      <h3 className="text-base px-2 font-medium flex items-center gap-1 text-slate-700">
        <span>{transitionSource}</span>
        <ArrowRightIcon weight="bold" />
        <span>{value.transition.target}</span>
      </h3>

      <GoalNameInput value={nameInput} onChange={setNameInput} />

      <label className="block space-y-1">
        <span className="text-slate-500">Type</span>
        <select
          value={modeInput}
          onChange={(event) =>
            setModeInput(
              event.target.value === "prompt" ? "prompt" : "conditions",
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
          value={conditionsInput}
          onChange={(event) => setConditionsInput(event.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      </label>

      {modeInput === "prompt" ? (
        <label className="block space-y-1">
          <span className="text-slate-500">Prompt</span>
          <input
            value={promptInput}
            onChange={(event) => setPromptInput(event.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        </label>
      ) : null}

      <button
        type="button"
        onClick={() => {
          const nextTransition =
            modeInput === "prompt"
              ? {
                  name: nameInput,
                  target: value.transition.target,
                  prompt: promptInput,
                  ...(conditionsInput ? { conditions: conditionsInput } : {}),
                }
              : {
                  name: nameInput,
                  target: value.transition.target,
                  conditions: conditionsInput,
                };

          onChange(nextTransition);
        }}
        className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
      >
        Apply
      </button>
    </section>
  );
}
