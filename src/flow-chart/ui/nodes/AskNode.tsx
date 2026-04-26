import { QuestionMarkIcon } from "@phosphor-icons/react";
import { Position, type NodeProps } from "@xyflow/react";

import { cn } from "../../../lib/utils";
import { goalDisplayName, type AskNode } from "../../flow-model";
import { SourceHandle } from "../SourceHandle";
import { TargetHandle } from "../TargetHandle";

export function AskNode({ selected, data }: NodeProps<AskNode>) {
  const fieldName = data.field.name || "answer";
  const fieldType = data.field.type === "boolean" ? "Boolean" : "Choice";
  const options = data.field.enum?.filter(Boolean).slice(0, 3) ?? [];

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
        <span className="text-base">{goalDisplayName(data.name)}</span>
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
      <div className="flex items-center gap-2 text-xs text-blue-800">
        <div className="size-3 rounded-xs bg-blue-800" />
        <span>
          {fieldType}: {fieldName}
          {data.field.optional && " (optional)"}
        </span>
      </div>
      {options.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {options.map((option) => (
            <span
              key={option}
              className="max-w-full truncate rounded-xs bg-blue-100 px-1.5 py-0.5 text-blue-800"
            >
              {option}
            </span>
          ))}
        </div>
      )}
      <SourceHandle position={Position.Bottom} />
    </div>
  );
}
