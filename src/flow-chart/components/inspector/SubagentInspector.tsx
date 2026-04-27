import { PlusIcon, RobotIcon, TrashIcon } from "@phosphor-icons/react";
import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

import { type FlowEdge, type SubagentNode } from "../../flow-model";
import { GoalNameInput } from "../GoalNameInput";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { cn } from "../../../lib/utils";

type SubagentExit = SubagentNode["data"]["exits"][number];

export function SubagentInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<SubagentNode, FlowEdge>();
  const node = useNodesData<SubagentNode>(id);
  const data = node?.data;

  const [prompts, setPrompts] = useState<string[]>(
    () => data?.exits.map((exit) => exit.prompt) ?? [],
  );
  const [prompt, setPrompt] = useState(data?.prompt ?? "");

  useEffect(
    () => setPrompts(data?.exits.map((exit) => exit.prompt) ?? []),
    [data?.exits, id],
  );
  useEffect(() => setPrompt(data?.prompt ?? ""), [data?.prompt, id]);

  if (!data) return null;

  const updateExit = (index: number, exit: SubagentExit) => {
    updateNodeData(id, {
      exits: data.exits.map((current, i) => (i === index ? exit : current)),
    });
  };

  const removeExit = (index: number) => {
    updateNodeData(id, { exits: data.exits.filter((_, i) => i !== index) });
  };

  return (
    <section className="space-y-4 p-3 text-sm">
      <label htmlFor="subagent-name" className="flex items-center">
        <RobotIcon
          className="size-6 cursor-text text-violet-700"
          weight="duotone"
        />
        <GoalNameInput
          id="subagent-name"
          value={data.name}
          onChange={(name) => updateNodeData(id, { name })}
        />
      </label>

      <label className="pb-10 cursor-text block">
        <span className="font-medium text-slate-700 mb-2 block cursor-default select-none">
          Prompt
        </span>
        <AutoResizeTextarea
          name="subagent-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onBlur={(event) => {
            const prompt = event.target.value;
            setPrompt(prompt);
            updateNodeData(id, { prompt });
          }}
          placeholder="Describe what this subagent should handle"
          className="w-full resize-none overflow-hidden text-slate-900 outline-none"
          spellCheck={true}
        />
      </label>

      <div className="space-y-2">
        <span className="font-medium text-slate-700 block select-none mb-2">
          Transitions
        </span>

        {
          <div className="space-y-3">
            {data.exits.map((exit, index) => (
              <div
                key={index}
                className="rounded-sm bg-slate-100 p-2 group focus-within:outline-2 outline-emerald-500 focus-within:bg-slate-50"
              >
                <div className="flex items-center gap-1">
                  <input
                    value={exit.name}
                    onChange={(event) =>
                      updateExit(index, { ...exit, name: event.target.value })
                    }
                    onBlur={(event) =>
                      updateExit(index, {
                        ...exit,
                        name:
                          event.currentTarget.value
                            .trim()
                            .replace(/\s{2,}/g, " ") ||
                          `Transition ${index + 1}`,
                      })
                    }
                    autoFocus={
                      index === data.exits.length - 1 &&
                      exit.name === `Transition ${index + 1}`
                    }
                    placeholder="Transition name"
                    className="min-w-0 flex-1 rounded-sm bg-transparent px-1.5 py-1 font-medium text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeExit(index)}
                    aria-label={`Remove ${exit.name || "transition"}`}
                    className="opacity-0 group-hover:opacity-100 cursor-pointer rounded-sm p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-700"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
                <AutoResizeTextarea
                  name={`subagent-exit-${index}-prompt`}
                  value={prompts[index] ?? exit.prompt}
                  onChange={(event) =>
                    setPrompts((prompts) =>
                      prompts.map((prompt, i) =>
                        i === index ? event.target.value : prompt,
                      ),
                    )
                  }
                  onBlur={(event) => {
                    const prompt = event.target.value;
                    setPrompts((prompts) =>
                      prompts.map((current, i) =>
                        i === index ? prompt : current,
                      ),
                    );
                    updateExit(index, { ...exit, prompt });
                  }}
                  placeholder="Describe when this transition should be used"
                  className="mt-1 w-full resize-none overflow-hidden rounded-sm bg-transparent px-1.5 py-1 text-slate-700 outline-none placeholder:text-slate-400 focus:outline-2"
                  spellCheck={true}
                />
              </div>
            ))}
          </div>
        }

        <button
          type="button"
          onClick={() =>
            updateNodeData(id, {
              exits: [
                ...data.exits,
                { name: `Transition ${data.exits.length + 1}`, prompt: "" },
              ],
            })
          }
          className={cn(
            "flex cursor-pointer items-center justify-center gap-1 w-full rounded-sm p-2 text-xs font-medium hover:text-violet-700 hover:bg-violet-100",
            data.exits.length === 0 && "bg-slate-100",
          )}
        >
          <PlusIcon weight="bold" className="size-3" />
          Add transition
        </button>
      </div>
    </section>
  );
}
