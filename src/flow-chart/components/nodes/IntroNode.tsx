import { UserCheckIcon } from "@phosphor-icons/react";
import { Position, type NodeProps } from "@xyflow/react";

import type { IntroNode as IntroNodeType } from "../../flow-model";
import { cn } from "../../lib/utils";
import { SourceHandle } from "../SourceHandle";

export function IntroNode({ selected }: NodeProps<IntroNodeType>) {
  return (
    <div
      className={cn(
        "flex w-64 flex-col gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-xs shadow-xs hover:bg-slate-100",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <h4 className="flex items-center gap-1 text-slate-800">
        <UserCheckIcon weight="duotone" className="size-4" />
        <span className="text-base">Call Intro</span>
      </h4>

      <p className="text-slate-600">
        The agent will handle pre-conversation steps and continue once the right person is
        reached.
      </p>

      <SourceHandle position={Position.Bottom} />
    </div>
  );
}
