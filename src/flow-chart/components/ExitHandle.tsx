import { PlusIcon } from "@phosphor-icons/react";
import { Handle, Position } from "@xyflow/react";
import { useRef, useState } from "react";

import { AddNodeMenu } from "./AddNodeMenu";

export function ExitHandle() {
  const [open, setOpen] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Handle
        ref={handleRef}
        type="target"
        position={Position.Top}
        isConnectable={false}
        title="Click to add connected node, drag the edge to connect"
        tabIndex={0}
        role="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex size-4! cursor-pointer items-center rounded-md! p-0.5"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (["Enter", " ", "ArrowDown"].includes(event.key)) setOpen(true);
        }}
      >
        <PlusIcon weight="bold" className="size-full text-slate-100" />
      </Handle>

      <AddNodeMenu anchor={handleRef} open={open} onOpenChange={setOpen} />
    </>
  );
}
