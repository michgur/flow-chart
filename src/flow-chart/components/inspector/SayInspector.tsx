import { QuotesIcon } from "@phosphor-icons/react";
import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

import { type FlowEdge, type SayNode } from "../../flow-model";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { GoalNameInput } from "../GoalNameInput";
import { Switch } from "../ui/Switch";
import { ToggleGroup, type ToggleOption } from "../ToggleGroup";

type SayMode = "script" | "prompt";

export function SayInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<SayNode, FlowEdge>();
  const node = useNodesData<SayNode>(id);
  const data = node?.data;

  const [prompt, setPrompt] = useState(data?.prompt ?? "");
  useEffect(() => setPrompt(data?.prompt ?? ""), [data?.prompt, id]);

  if (!data) return null;

  const mode: SayMode = data.static ? "script" : "prompt";

  return (
    <section className="space-y-3 p-3 text-sm">
      <label htmlFor="say-name" className="flex items-center">
        <QuotesIcon className="size-6 cursor-text" weight="duotone" />
        <GoalNameInput
          id="say-name"
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
          ] satisfies ToggleOption<SayMode>[]
        }
      />

      <AutoResizeTextarea
        name="goal-prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onBlur={(event) => {
          const prompt = event.target.value;
          setPrompt(prompt);
          updateNodeData(id, { prompt });
        }}
        placeholder={
          data.static
            ? "Enter exact message for agent to say"
            : "e.g. Greet the user"
        }
        className="w-full resize-none overflow-hidden text-slate-900 outline-none"
        spellCheck={true}
      />

      <Switch
        label="Wait for user response"
        value={data.waitForResponse}
        onChange={(waitForResponse) => updateNodeData(id, { waitForResponse })}
        className="-mx-2 px-2 font-medium"
      />
    </section>
  );
}
