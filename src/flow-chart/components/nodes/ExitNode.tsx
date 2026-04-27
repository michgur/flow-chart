import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { ExitNode as ExitNodeType } from "../../flow-model";
import { SourceHandle } from "../SourceHandle";

export function ExitNode({ data }: NodeProps<ExitNodeType>) {
  return (
    <div title={data.name} className="relative w-4 h-1">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="size-1! border-none! bg-transparent! opacity-0!"
      />
      <SourceHandle position={Position.Bottom} className="" />
    </div>
  );
}
