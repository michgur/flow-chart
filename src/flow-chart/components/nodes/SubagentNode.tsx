import { RobotIcon } from "@phosphor-icons/react";
import { Handle, Position, type NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect } from "react";

import { goalDisplayName, type SubagentNode as SubagentNodeType } from "../../flow-model";
import { cn } from "../../lib/utils";
import { TargetHandle } from "../TargetHandle";

export function SubagentNode({ id, selected, data }: NodeProps<SubagentNodeType>) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => updateNodeInternals(id), [data.exits, id, updateNodeInternals]);

  return (
    <div
      className={cn(
        "flex w-64 flex-col gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs shadow-xs hover:bg-amber-100 active:scale-99",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <TargetHandle position={Position.Top} />
      <h4 className="flex items-center gap-1 text-amber-700">
        <RobotIcon weight="duotone" className="size-4" />
        <span className="overflow-hidden text-base text-ellipsis whitespace-nowrap">
          {goalDisplayName(data.name)}
        </span>
      </h4>
      {data.prompt && (
        <p className="line-clamp-3 overflow-hidden text-ellipsis text-amber-700/60">
          {data.prompt}
        </p>
      )}
      {data.tools.length > 0 && (
        <div>
          {data.tools.map((t) => (
            <div>{t.name}</div>
          ))}
        </div>
      )}
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
