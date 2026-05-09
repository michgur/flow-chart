import { Position, type NodeProps } from "@xyflow/react";

import { goalDisplayName, type GoalNode } from "../flow-model";
import { cn } from "../lib/utils";
import { SourceHandle } from "./SourceHandle";
import { TargetHandle } from "./TargetHandle";

export function GoalNode({ data, selected }: NodeProps<GoalNode>) {
  const label = goalDisplayName(data.name);

  return (
    <div
      className={cn(
        "group min-w-36 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-xs shadow-xs hover:bg-slate-100 active:scale-99",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <TargetHandle position={Position.Top} />

      <div className="font-medium text-slate-700">{label}</div>

      <SourceHandle position={Position.Bottom} />
    </div>
  );
}
