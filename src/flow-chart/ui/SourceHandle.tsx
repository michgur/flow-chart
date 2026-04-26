import { PlusIcon } from "@phosphor-icons/react";
import { Handle, Position, useNodeConnections } from "@xyflow/react";
import { useRef, useState } from "react";

import { cn } from "../../lib/utils";
import { AddNodeMenu } from "./AddNodeMenu";

type SourceHandleProps = {
  id?: string;
  position?: Position;
  className?: string;
};

export function SourceHandle({ id, position = Position.Bottom, className }: SourceHandleProps) {
  const [open, setOpen] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const connections = useNodeConnections(
    id === undefined ? { handleType: "source" } : { handleType: "source", handleId: id },
  );
  const canAdd = connections.length === 0;

  return (
    <>
      <Handle
        ref={handleRef}
        id={id}
        type="source"
        position={position}
        title="Click to add connected node, drag to connect"
        tabIndex={canAdd ? 0 : undefined}
        role={canAdd ? "button" : undefined}
        aria-haspopup={canAdd ? "menu" : undefined}
        aria-expanded={canAdd ? open : undefined}
        className={cn(
          "relative",
          canAdd && "flex size-4! items-center rounded-md! p-0.5",
          className,
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        onKeyDown={(e) => ["Enter", " ", "ArrowDown"].includes(e.key) && setOpen(true)}
      >
        {canAdd && <PlusIcon weight="bold" className="size-full text-slate-100" />}
      </Handle>

      {canAdd && (
        <AddNodeMenu anchor={handleRef} open={open} onOpenChange={setOpen} sourceHandleId={id} />
      )}
    </>
  );
}
