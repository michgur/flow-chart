import { ClockUserIcon } from "@phosphor-icons/react";
import { Position, type NodeProps } from "@xyflow/react";

import { type ScheduleCallbackNode as ScheduleCallbackNodeType } from "../../flow-model";
import { cn } from "../../lib/utils";
import { TargetHandle } from "../TargetHandle";

export function ScheduleCallbackNode({ selected }: NodeProps<ScheduleCallbackNodeType>) {
  return (
    <div
      className={cn(
        "flex w-64 flex-col gap-2 rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs shadow-xs hover:bg-slate-100 active:scale-99",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <TargetHandle position={Position.Top} />
      <h4 className="flex items-center gap-1 text-slate-700">
        <ClockUserIcon weight="duotone" className="size-4" />
        <span className="text-base">Schedule Callback</span>
      </h4>
      <p className="text-slate-600">
        The agent will schedule a time to call back with the contact.
      </p>
    </div>
  );
}
