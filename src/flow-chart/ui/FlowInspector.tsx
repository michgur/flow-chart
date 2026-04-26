import {
  Panel,
  useOnSelectionChange,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import { type FlowNode } from "../flow-model";
import { GoalInspector } from "./GoalInspector";
import { useCallback, useState } from "react";
import { SayInspector } from "./inspector/SayInspector";

export function FlowInspector() {
  const [selection, setSelection] = useState<FlowNode | null>(null);

  const onChange: OnSelectionChangeFunc<FlowNode> = useCallback(
    ({ nodes }) => setSelection(nodes.length === 1 ? nodes[0] : null),
    [],
  );

  useOnSelectionChange({ onChange });

  if (!selection) return null;

  return (
    <Panel
      position="top-right"
      className="inset-3! inset-s-auto! m-0! w-80 space-y-3 overflow-y-auto rounded-md border border-slate-300 bg-slate-50"
    >
      {selection.type === "goal" ? (
        <GoalInspector id={selection.id} />
      ) : (
        <SayInspector id={selection.id} />
      )}
    </Panel>
  );
}
