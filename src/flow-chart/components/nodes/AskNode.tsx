import { QuestionMarkIcon } from "@phosphor-icons/react";
import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { useEffect } from "react";

import { cn } from "../../../lib/utils";
import { goalDisplayName, type AskNode } from "../../flow-model";
import { TargetHandle } from "../TargetHandle";

export function AskNode({ id, selected, data }: NodeProps<AskNode>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const fieldType = data.field.type === "boolean" ? "Yes / No" : "Choice";

  useEffect(
    () => updateNodeInternals(id),
    [data.exits, id, updateNodeInternals],
  );

  return (
    <div
      className={cn(
        "flex w-64 flex-col gap-2 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-xs shadow-xs hover:bg-slate-100 active:scale-99",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <TargetHandle position={Position.Top} />
      <h4 className="flex items-center gap-1 text-slate-600">
        <QuestionMarkIcon weight="duotone" className="size-4" />
        <span className="text-base overflow-hidden text-ellipsis whitespace-nowrap">
          {goalDisplayName(data.name)}
        </span>
      </h4>
      {data.prompt && (
        <p
          className={cn(
            "line-clamp-3 overflow-hidden text-ellipsis text-slate-400",
            data.static && "border-s-2 border-slate-200 ps-2",
          )}
        >
          {data.prompt}
        </p>
      )}
      <div className="text-xs text-slate-500">
        <span>
          Answer type: {fieldType}
          {data.field.optional && " (optional)"}
        </span>
      </div>
      {data.exits.map((exit) => (
        <Handle
          key={exit.name}
          id={exit.name}
          type="source"
          position={Position.Bottom}
          className="size-1! border-none! bg-transparent! opacity-0!"
        />
      ))}
    </div>
  );
}
