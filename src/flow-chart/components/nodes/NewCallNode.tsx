import { PhonePlusIcon } from "@phosphor-icons/react";
import { Position, type NodeProps } from "@xyflow/react";

import { goalDisplayName, type NewCallNode } from "../../flow-model";
import { cn } from "../../lib/utils";
import { TargetHandle } from "../TargetHandle";

export function NewCallNode({ selected, data }: NodeProps<NewCallNode>) {
  return (
    <div
      className={cn(
        "flex w-64 flex-col gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-xs shadow-xs hover:bg-slate-100 active:scale-99",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <TargetHandle position={Position.Top} />
      <h4 className="flex items-center gap-1 text-slate-700">
        <PhonePlusIcon weight="duotone" className="size-4" />
        <span className="overflow-hidden text-base text-ellipsis whitespace-nowrap">
          {goalDisplayName(data.name)}
        </span>
      </h4>

      {data.prompt && (
        <p
          className={cn(
            "line-clamp-3 overflow-hidden text-ellipsis text-slate-600",
            data.static && "border-s-2 border-slate-300 ps-2",
          )}
        >
          {data.prompt}
        </p>
      )}

      <span className="text-slate-700">Agent: {data.agent}</span>
      <span className="text-slate-600">Phone: {data.phoneNumber}</span>
      {data.idleMessages.length > 0 && (
        <span className="text-slate-600">Idle messages: {data.idleMessages.length}</span>
      )}
    </div>
  );
}
