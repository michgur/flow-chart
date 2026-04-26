import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

import { type FlowEdge, type FlowNode, type GoalNode } from "../flow-model";
import { AutoResizeTextarea } from "./ui/AutoResizeTextarea";
import { GoalNameInput } from "./GoalNameInput";

export function GoalInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<FlowNode, FlowEdge>();
  const node = useNodesData<GoalNode>(id);
  const goal = node?.data;

  const [prompt, setPrompt] = useState(goal?.messages ?? "");
  useEffect(() => setPrompt(goal?.messages ?? ""), [goal?.messages, id]);

  if (!goal) return null;
  return (
    <section className="space-y-2 p-2 text-sm">
      <GoalNameInput
        value={goal.name}
        onChange={(name) => updateNodeData(id, { name })}
      />

      <label className="flex cursor-text flex-col gap-2 px-2 pb-10">
        <span className="cursor-default text-slate-500">Prompt</span>
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
