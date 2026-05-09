import { PhonePlusIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

import { type FlowEdge, type NewCallNode } from "../../flow-model";
import { cn } from "../../lib/utils";
import { GoalNameInput } from "../GoalNameInput";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { ToggleGroup, type ToggleOption } from "../ui/ToggleGroup";

type NewCallMode = "script" | "prompt";

export function NewCallInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<NewCallNode, FlowEdge>();
  const node = useNodesData<NewCallNode>(id);
  const data = node?.data;

  const [prompt, setPrompt] = useState(data?.prompt ?? "");
  const [preMergeMessage, setPreMergeMessage] = useState(data?.preMergeMessage ?? "");
  const [parentFailMessage, setParentFailMessage] = useState(data?.parentFailMessage ?? "");
  const [brief, setBrief] = useState(data?.brief ?? "");
  const [idleMessages, setIdleMessages] = useState(data?.idleMessages ?? []);

  useEffect(() => setPrompt(data?.prompt ?? ""), [data?.prompt, id]);
  useEffect(() => setPreMergeMessage(data?.preMergeMessage ?? ""), [data?.preMergeMessage, id]);
  useEffect(
    () => setParentFailMessage(data?.parentFailMessage ?? ""),
    [data?.parentFailMessage, id],
  );
  useEffect(() => setBrief(data?.brief ?? ""), [data?.brief, id]);
  useEffect(() => setIdleMessages(data?.idleMessages ?? []), [data?.idleMessages, id]);

  if (!data) return null;

  const mode: NewCallMode = data.static ? "script" : "prompt";

  const updateIdleMessages = (next: NewCallNode["data"]["idleMessages"]) => {
    setIdleMessages(next);
    updateNodeData(id, { idleMessages: next });
  };

  return (
    <section className="space-y-3 p-3 text-sm">
      <label htmlFor="newcall-name" className="flex items-center">
        <PhonePlusIcon className="size-6 cursor-text" weight="duotone" />
        <GoalNameInput
          id="newcall-name"
          value={data.name}
          onChange={(name) => updateNodeData(id, { name })}
        />
      </label>

      <ToggleGroup
        className="w-fit text-xs"
        value={mode}
        onChange={(mode) => updateNodeData(id, { static: mode === "script" })}
        options={
          [
            { value: "script", label: "Script" },
            { value: "prompt", label: "Prompt" },
          ] satisfies ToggleOption<NewCallMode>[]
        }
      />

      <AutoResizeTextarea
        name="newcall-prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onBlur={(event) => {
          const prompt = event.target.value;
          setPrompt(prompt);
          updateNodeData(id, { prompt });
        }}
        placeholder={data.static ? "Enter exact transfer message" : "e.g. Transfer the caller"}
        className="w-full resize-none overflow-hidden text-slate-900 outline-none"
        spellCheck={true}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="font-medium text-slate-700">Agent</span>
          <input
            value={data.agent}
            onChange={(event) => updateNodeData(id, { agent: event.target.value })}
            placeholder="agent id"
            className="w-full rounded-sm bg-slate-100 px-2 py-1.5 outline-emerald-500 focus:bg-slate-50 focus:outline-2"
          />
        </label>

        <label className="space-y-1">
          <span className="font-medium text-slate-700">Phone number</span>
          <input
            value={data.phoneNumber}
            onChange={(event) => updateNodeData(id, { phoneNumber: event.target.value })}
            placeholder="+15551234567"
            className="w-full rounded-sm bg-slate-100 px-2 py-1.5 outline-emerald-500 focus:bg-slate-50 focus:outline-2"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="font-medium text-slate-700">Pre-merge message</span>
        <AutoResizeTextarea
          name="newcall-pre-merge"
          value={preMergeMessage}
          onChange={(event) => setPreMergeMessage(event.target.value)}
          onBlur={(event) => {
            const preMergeMessage = event.target.value;
            setPreMergeMessage(preMergeMessage);
            updateNodeData(id, { preMergeMessage: preMergeMessage || undefined });
          }}
          placeholder="Optional message before merge"
          className="w-full resize-none overflow-hidden rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 placeholder:text-slate-400 focus:bg-slate-50 focus:outline-2"
          spellCheck={true}
        />
      </label>

      <label className="block space-y-1">
        <span className="font-medium text-slate-700">Parent fail message</span>
        <AutoResizeTextarea
          name="newcall-parent-fail"
          value={parentFailMessage}
          onChange={(event) => setParentFailMessage(event.target.value)}
          onBlur={(event) => {
            const parentFailMessage = event.target.value;
            setParentFailMessage(parentFailMessage);
            updateNodeData(id, { parentFailMessage: parentFailMessage || undefined });
          }}
          placeholder="Optional fallback message"
          className="w-full resize-none overflow-hidden rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 placeholder:text-slate-400 focus:bg-slate-50 focus:outline-2"
          spellCheck={true}
        />
      </label>

      <label className="block space-y-1">
        <span className="font-medium text-slate-700">Brief</span>
        <AutoResizeTextarea
          name="newcall-brief"
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          onBlur={(event) => {
            const brief = event.target.value;
            setBrief(brief);
            updateNodeData(id, { brief: brief || undefined });
          }}
          placeholder="Optional context passed to destination"
          className="w-full resize-none overflow-hidden rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 placeholder:text-slate-400 focus:bg-slate-50 focus:outline-2"
          spellCheck={true}
        />
      </label>

      <div className="space-y-2">
        <span className="mb-2 block font-medium text-slate-700">Idle messages</span>

        <div className="space-y-2">
          {idleMessages.map((message, index) => (
            <div
              key={index}
              className="group rounded-sm bg-slate-100 p-2 outline-emerald-500 focus-within:bg-slate-50 focus-within:outline-2"
            >
              <div className="flex gap-2">
                <input
                  value={message.text}
                  onChange={(event) =>
                    updateIdleMessages(
                      idleMessages.map((current, i) =>
                        i === index ? { ...current, text: event.target.value } : current,
                      ),
                    )
                  }
                  placeholder="Hold message"
                  className="min-w-0 flex-1 rounded-sm bg-transparent px-1.5 py-1 text-slate-900 outline-none"
                />
                <input
                  type="number"
                  min={0}
                  value={message.timeout}
                  onChange={(event) =>
                    updateIdleMessages(
                      idleMessages.map((current, i) =>
                        i === index
                          ? { ...current, timeout: event.currentTarget.valueAsNumber || 0 }
                          : current,
                      ),
                    )
                  }
                  className="w-20 rounded-sm bg-transparent px-1.5 py-1 text-right text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateIdleMessages(idleMessages.filter((_, current) => current !== index))
                  }
                  aria-label="Remove idle message"
                  className="cursor-pointer rounded-sm p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-700"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => updateIdleMessages([...idleMessages, { text: "", timeout: 30 }])}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-1 rounded-sm p-2 text-xs font-medium hover:bg-violet-100 hover:text-violet-700",
            idleMessages.length === 0 && "bg-slate-100",
          )}
        >
          <PlusIcon weight="bold" className="size-3" />
          Add idle message
        </button>
      </div>
    </section>
  );
}
