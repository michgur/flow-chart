import {
  Handle,
  Position,
  useConnection,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  generateGoalId,
  goalDisplayName,
  type GoalFlowNodeData,
} from "../script-adapter";
import { PlusIcon } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";
import { useScriptStore } from "../hooks/use-script";
import { addGoalAfter } from "../script-actions";
import { useCallback } from "react";

export function GoalNode({
  data,
  selected,
}: NodeProps<Node<GoalFlowNodeData>>) {
  const connection = useConnection();
  const store = useScriptStore();
  const label = goalDisplayName(data.goal.name);

  const onAddGoal = useCallback(() => {
    const id = generateGoalId();
    store.set((model) => addGoalAfter(model, data.goal.id, { id }));
    store.select({ kind: "goal", id });
  }, []);

  return (
    <div
      className={cn(
        "group min-w-36 rounded-sm border border-slate-300 bg-slate-50 hover:bg-slate-100 active:scale-99 px-3 py-2 text-xs shadow-xs",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-0! min-h-0! border-none!"
      />
      {connection.inProgress && (
        <Handle
          type="target"
          position={Position.Top}
          className="inset-0! size-auto! absolute! opacity-0 transform-none! rounded-none!"
        />
      )}
      <div className="font-medium text-slate-700">{label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        title="Click to add connected goal, drag to connect"
        className="relative"
        onClick={onAddGoal}
      >
        <div className="opacity-0 group-hover:opacity-100 absolute top-1/2 inset-s-1/2 -translate-1/2 pointer-events-none border-2 border-slate-50 text-slate-50 bg-slate-900 size-4 flex items-center justify-center rounded-full">
          <PlusIcon weight="bold" size={8} />
        </div>
      </Handle>
    </div>
  );
}
