import { PhoneDisconnectIcon } from "@phosphor-icons/react";
import { Position, type NodeProps } from "@xyflow/react";

import { goalDisplayName, type HangupNode as HangupNodeType } from "../../flow-model";
import { cn } from "../../lib/utils";
import { TargetHandle } from "../TargetHandle";

export function HangupNode({ selected, data }: NodeProps<HangupNodeType>) {
  return (
    <div
      className={cn(
        "flex w-64 flex-col gap-2 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-xs shadow-xs hover:bg-rose-100 active:scale-99",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <TargetHandle position={Position.Top} />
      <h4 className="flex items-center gap-1 text-rose-700">
        <PhoneDisconnectIcon weight="duotone" className="size-4" />
        <span className="overflow-hidden text-base text-ellipsis whitespace-nowrap">
          {goalDisplayName(data.name)}
        </span>
      </h4>

      {data.prompt && (
        <p className="line-clamp-3 overflow-hidden text-ellipsis text-rose-700/70">{data.prompt}</p>
      )}

      {data.callResult && <span className="text-rose-800">Call result: {data.callResult}</span>}
    </div>
  );
}
