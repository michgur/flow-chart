import { PhoneDisconnectIcon } from "@phosphor-icons/react";
import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

import { type FlowEdge, type HangupNode } from "../../flow-model";
import { GoalNameInput } from "../GoalNameInput";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";

export function HangupInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<HangupNode, FlowEdge>();
  const node = useNodesData<HangupNode>(id);
  const data = node?.data;

  const [prompt, setPrompt] = useState(data?.prompt ?? "");
  const [callResult, setCallResult] = useState(data?.callResult ?? "");

  useEffect(() => setPrompt(data?.prompt ?? ""), [data?.prompt, id]);
  useEffect(() => setCallResult(data?.callResult ?? ""), [data?.callResult, id]);

  if (!data) return null;

  return (
    <section className="space-y-3 p-3 text-sm">
      <label htmlFor="hangup-name" className="flex items-center">
        <PhoneDisconnectIcon className="size-6 cursor-text" weight="duotone" />
        <GoalNameInput
          id="hangup-name"
          value={data.name}
          onChange={(name) => updateNodeData(id, { name })}
        />
      </label>

      <AutoResizeTextarea
        name="hangup-prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onBlur={(event) => {
          const prompt = event.target.value;
          setPrompt(prompt);
          updateNodeData(id, { prompt });
        }}
        placeholder="Optional message before ending the call"
        className="w-full resize-none overflow-hidden text-slate-900 outline-none"
        spellCheck={true}
      />

      <label className="space-y-1">
        <span className="block font-medium text-slate-700">Call result</span>
        <input
          value={callResult}
          onChange={(event) => setCallResult(event.target.value)}
          onBlur={(event) => {
            const callResult = event.target.value;
            setCallResult(callResult);
            updateNodeData(id, { callResult: callResult || undefined });
          }}
          placeholder="Optional result value"
          className="w-full rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 placeholder:text-slate-400 focus:bg-slate-50 focus:outline-2"
        />
      </label>
    </section>
  );
}
