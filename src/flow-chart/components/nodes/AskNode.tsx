import { QuestionMarkIcon } from "@phosphor-icons/react";
import { Position, type NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect } from "react";

import { cn } from "../../../lib/utils";
import { goalDisplayName, type AskNode } from "../../flow-model";
import { SourceHandle } from "../SourceHandle";
import { TargetHandle } from "../TargetHandle";

export function AskNode({ id, selected, data }: NodeProps<AskNode>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const fieldType = data.field.type === "boolean" ? "Yes / No" : "Choice";
  const enumOptions = data.field.enum?.filter(Boolean) ?? [];
  const answerExits =
    data.field.type === "boolean"
      ? [
          { id: "true", label: "Yes" },
          { id: "false", label: "No" },
        ]
      : enumOptions.length > 0
        ? enumOptions.map((option) => ({ id: option, label: option }))
        : [{ id: undefined, label: "Next" }];
  const exits = data.field.optional
    ? [...answerExits, { id: "refused", label: "Refused to answer" }]
    : answerExits;

  useEffect(
    () => updateNodeInternals(id),
    [data.field.enum, data.field.optional, data.field.type, id, updateNodeInternals],
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
      <div className="text-xs text-slate-500">
        <span>
          Answer type: {fieldType}
          {data.field.optional && " (optional)"}
        </span>
      </div>
      <div className="-mx-3 mt-1 -mb-2 border-t border-slate-200 text-slate-600">
        {exits.map((exit) => (
          <div key={exit.id ?? "default"} className="relative flex min-h-7 items-center px-3 pr-7">
            <span>{exit.label}</span>
            <SourceHandle
              id={exit.id}
              position={Position.Right}
              className="absolute! top-1/2! right-0!"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
