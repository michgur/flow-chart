import { useNodesData, useReactFlow, useStore } from "@xyflow/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import {
  goalDisplayName,
  type FlowEdge,
  type FlowNode,
  type TransitionEdgeData,
} from "../flow-model";
import { GoalNameInput } from "./GoalNameInput";

export function TransitionInspector({ id }: { id: string }) {
  const { updateEdge } = useReactFlow<FlowNode, FlowEdge>();
  const edge = useStore(
    (state) => state.edges.find((item) => item.id === id) as FlowEdge | undefined,
  );

  const nodes = useNodesData<FlowNode>(edge ? [edge.source, edge.target] : []);
  const source = nodes.at(0)?.data;
  const target = nodes.at(1)?.data;

  if (!edge) return null;

  const sourceLabel = source?.kind === "goal" ? goalDisplayName(source.name) : "";
  const targetLabel = target?.kind === "goal" ? goalDisplayName(target.name) : "";

  const hasPrompt = edge.data?.prompt !== undefined;

  const update = (change: Partial<TransitionEdgeData>) =>
    updateEdge(id, (current) => {
      const data = {
        ...(current.data ?? { kind: "transition", name: "transition" }),
        ...change,
      };
      return {
        data,
        label: data.name,
      };
    });
  return (
    <section className="space-y-2 px-2 py-4">
      <h3 className="flex items-center gap-1 px-2 text-base font-medium text-slate-700">
        <span>{sourceLabel}</span>
        <ArrowRightIcon weight="bold" />
        <span>{targetLabel}</span>
      </h3>

      <GoalNameInput
        value={edge.data?.name ?? "transition"}
        onChange={(name) => update({ name })}
        placeholder="transition-name"
      />

      <label className="block space-y-1">
        <span className="text-slate-500">Type</span>
        <select
          value={hasPrompt ? "prompt" : "conditions"}
          onChange={(event) =>
            update(
              event.target.value === "prompt"
                ? { prompt: edge.data?.prompt ?? "" }
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
          value={edge.data?.conditions ?? ""}
          onChange={(event) =>
            update({
              conditions: event.target.value || undefined,
            })
          }
          className="w-full rounded border border-slate-300 px-2 py-1"
        />
      </label>

      {hasPrompt && (
        <label className="block space-y-1">
          <span className="text-slate-500">Prompt</span>
          <input
            value={edge.data?.prompt ?? ""}
            onChange={(event) =>
              update({
                prompt: event.target.value || undefined,
              })
            }
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        </label>
      )}
    </section>
  );
}
