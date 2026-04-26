import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { type FlowEdge, type SayNode } from "../../flow-model";
import { AutoResizeTextarea } from "../AutoResizeTextarea";

export function SayInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<SayNode, FlowEdge>();
  const node = useNodesData<SayNode>(id);
  const data = node?.data;

  const [prompt, setPrompt] = useState(data?.prompt ?? "");
  useEffect(() => setPrompt(data?.prompt ?? ""), [data?.prompt, id]);

  if (!data) return null;
  return (
    <section className="space-y-2 text-sm p-2">
      <label className="flex flex-col gap-2 px-2 pb-10 cursor-text">
        <span className="text-slate-500 cursor-default">Prompt</span>
        <AutoResizeTextarea
          name="goal-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onBlur={(event) => {
            const prompt = event.target.value;
            setPrompt(prompt);
            updateNodeData(id, { prompt });
          }}
          placeholder="Optional prompt context"
          className="w-full resize-none overflow-hidden outline-none"
          spellCheck={true}
        />
      </label>
    </section>
  );
}
