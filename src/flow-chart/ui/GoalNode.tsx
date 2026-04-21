import { Handle, Position, useConnection, type Node, type NodeProps } from "@xyflow/react";
import type { GoalFlowNodeData } from "../adapter";
import { PlusIcon } from "@phosphor-icons/react";
import { goalNameToDisplayName } from "../goal-name";
import { cn } from "../../lib/utils";
import { useFlowContext } from "../flow-context";

export function GoalNode({ data, selected }: NodeProps<Node<GoalFlowNodeData>>) {
  const connection = useConnection();
  const context = useFlowContext();

  return (
    <div
      className={cn(
        "group min-w-36 rounded-sm border border-slate-300 bg-slate-50 hover:bg-slate-100 active:scale-99 px-3 py-2 text-xs shadow-xs",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <Handle type="target" position={Position.Top} className="h-0! min-h-0! border-none!" />
      {connection.inProgress && (
        <Handle
          type="target"
          position={Position.Top}
          className="inset-0! size-auto! absolute! opacity-0 transform-none! rounded-none!"
        />
      )}
      <div className="font-medium text-slate-700">{goalNameToDisplayName(data.goal.name)}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        title="Click to add connected goal, drag to connect"
        className="relative"
        onClick={() => context.createGoal?.(data.goal.name)}
      >
        <div className="opacity-0 group-hover:opacity-100 absolute top-1/2 inset-s-1/2 -translate-1/2 pointer-events-none border border-slate-50 text-slate-50 bg-slate-900 size-4 flex items-center justify-center rounded-full">
          <PlusIcon weight="bold" size={8} />
        </div>
      </Handle>
    </div>
  );
}
