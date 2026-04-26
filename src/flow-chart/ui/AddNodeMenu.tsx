import { Menu } from "@base-ui/react/menu";
import { QuestionMarkIcon, QuotesIcon } from "@phosphor-icons/react";
import { useNodeId, useReactFlow } from "@xyflow/react";
import type { RefObject } from "react";

import { generateTransitionEdgeId, type FlowEdge, type FlowNode } from "../flow-model";

type AddNodeType = "say" | "ask";

type AddNodeMenuProps = {
  anchor: RefObject<HTMLDivElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceHandleId?: string;
};

const options = [
  { type: "say", label: "Say", Icon: QuotesIcon },
  { type: "ask", label: "Ask", Icon: QuestionMarkIcon },
] satisfies { type: AddNodeType; label: string; Icon: typeof QuotesIcon }[];

export function AddNodeMenu({ anchor, open, onOpenChange, sourceHandleId }: AddNodeMenuProps) {
  const nodeId = useNodeId();
  const { getNode, setEdges, setNodes } = useReactFlow<FlowNode, FlowEdge>();

  function addNode(type: AddNodeType) {
    if (!nodeId) return;

    const source = getNode(nodeId);
    if (!source) return;

    const nextId = `${type}:${crypto.randomUUID()}`;
    const nextNode: FlowNode =
      type === "say"
        ? {
            id: nextId,
            type: "say",
            data: {
              name: "Say",
              static: true,
              prompt: "",
              waitForResponse: false,
            },
            position: {
              x: source.position.x,
              y: source.position.y + 120,
            },
            selected: true,
          }
        : {
            id: nextId,
            type: "ask",
            data: {
              name: "Ask",
              static: true,
              prompt: "",
              field: {
                name: "answer",
                type: "boolean",
              },
            },
            position: {
              x: source.position.x,
              y: source.position.y + 120,
            },
            selected: true,
          };

    setNodes((nodes) => [...nodes.map((node) => ({ ...node, selected: false })), nextNode]);

    setEdges((edges) => [
      ...edges,
      {
        id: generateTransitionEdgeId(),
        source: nodeId,
        sourceHandle: sourceHandleId ?? null,
        target: nextId,
        animated: true,
      },
    ]);
  }

  return (
    <Menu.Root open={open} onOpenChange={onOpenChange}>
      <Menu.Portal>
        <Menu.Positioner anchor={anchor} sideOffset={8} className="outline-none">
          <Menu.Popup className="nodrag nopan transition-transform,scale,opacity z-50 min-w-32 origin-(--transform-origin) rounded-md bg-slate-50 p-1 text-sm text-slate-700 shadow-sm outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {options.map(({ type, label, Icon }) => (
              <Menu.Item
                key={type}
                onClick={() => {
                  addNode(type);
                  onOpenChange(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 font-medium outline-none select-none data-highlighted:bg-slate-800 data-highlighted:text-slate-50"
              >
                <Icon weight="duotone" className="size-4" />
                {label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
