import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { type FlowEdge, type FlowNode, type GoalNode } from "../flow-model";
import { GoalNameInput } from "./GoalNameInput";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

export function GoalInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<FlowNode, FlowEdge>();
  const node = useNodesData<GoalNode>(id);
  const goal = node?.data;

  const [prompt, setPrompt] = useState(goal?.messages ?? "");
  useEffect(() => setPrompt(goal?.messages ?? ""), [goal?.messages, id]);

  if (!goal) return null;
  return (
    <section className="space-y-2 text-sm p-2">
      <GoalNameInput value={goal.name} onChange={(name) => updateNodeData(id, { name })} />

      <label className="flex flex-col gap-2 px-2 pb-10 cursor-text">
        <span className="text-slate-500 cursor-default">Prompt</span>
        <AutoResizeTextarea
          name="goal-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onBlur={(event) => {
            const messages = event.target.value || undefined;
            setPrompt(event.target.value);
            updateNodeData(id, { messages });
          }}
          placeholder="Optional prompt context"
          className="w-full resize-none overflow-hidden outline-none"
          spellCheck={true}
        />
      </label>
    </section>
  );
}
