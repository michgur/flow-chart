import { Handle, Position, useConnection, type NodeProps } from "@xyflow/react";
import type { SayNode } from "../../flow-model";
import { cn } from "../../../lib/utils";
import { PlusIcon } from "@phosphor-icons/react";

export function SayNode({ selected, data }: NodeProps<SayNode>) {
  const { inProgress } = useConnection();
  return (
    <div
      className={cn(
        "group min-w-36 rounded-sm border border-slate-300 bg-slate-50 hover:bg-slate-100 active:scale-99 px-3 py-2 text-xs shadow-xs",
        selected && "border-emerald-500 shadow-emerald-950/5",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-0! min-h-0! border-none!"
      />

      {inProgress && (
        <Handle
          type="target"
          position={Position.Top}
          className="inset-0! size-auto! absolute! opacity-0 transform-none! rounded-none!"
        />
      )}

      <div className="font-medium text-slate-700">{data.prompt}</div>

      <Handle
        type="source"
        position={Position.Bottom}
        title="Click to add connected goal, drag to connect"
        className="relative"
      >
        <div className="opacity-0 group-hover:opacity-100 absolute top-1/2 inset-s-1/2 -translate-1/2 pointer-events-none border-2 border-slate-50 text-slate-50 bg-slate-900 size-4 flex items-center justify-center rounded-full">
          <PlusIcon weight="bold" size={8} />
        </div>
      </Handle>
    </div>
  );
}
