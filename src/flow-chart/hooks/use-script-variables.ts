import { useNodes } from "@xyflow/react";
import { useMemo } from "react";

import type { FlowNode } from "../flow-model";

export function useScriptVariables() {
  const nodes = useNodes<FlowNode>();

  const vars = useMemo(() => {
    const unique = new Set<string>();

    for (const node of nodes) {
      if (node.type !== "ask") continue;

      const name = node.data.field.name.trim();
      if (!name) continue;
      unique.add(name);
    }

    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [nodes]);

  return { vars } as const;
}
