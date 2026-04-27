import { Panel, useOnSelectionChange, type OnSelectionChangeFunc } from "@xyflow/react";
import { useCallback, useState } from "react";

import { type FlowNode } from "../flow-model";
import { GoalInspector } from "./GoalInspector";
import { AskInspector } from "./inspector/AskInspector";
import { SayInspector } from "./inspector/SayInspector";
import { SubagentInspector } from "./inspector/SubagentInspector";

export function FlowInspector() {
  const [selection, setSelection] = useState<FlowNode | null>(null);

  const onChange: OnSelectionChangeFunc<FlowNode> = useCallback(
    ({ nodes }) => setSelection(nodes.length === 1 ? nodes[0] : null),
    [],
  );

  useOnSelectionChange({ onChange });

  if (!selection) return null;

  const inspector =
    selection.type === "goal" ? (
      <GoalInspector id={selection.id} />
    ) : selection.type === "say" ? (
      <SayInspector id={selection.id} />
    ) : selection.type === "ask" ? (
      <AskInspector id={selection.id} />
    ) : selection.type === "subagent" ? (
      <SubagentInspector id={selection.id} />
    ) : null;

  if (!inspector) return null;

  return (
    <Panel
      position="top-right"
      className="inset-3! inset-s-auto! m-0! w-80 space-y-3 overflow-y-auto rounded-md border border-slate-300 bg-slate-50"
    >
      {inspector}
    </Panel>
  );
}
