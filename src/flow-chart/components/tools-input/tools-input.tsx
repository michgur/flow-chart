import { PlusIcon } from "@phosphor-icons/react";

import type { ToolConfig } from "../../data-model";
import { cn } from "../../lib/utils";
import { ToolEditorCard } from "./tool-editor-card";
import { createEmptyTool } from "./tools-input-utils";

type ToolsInputProps = {
  value: ToolConfig[];
  onChange: (value: ToolConfig[]) => void;
};

export function ToolsInput({ value, onChange }: ToolsInputProps) {
  const tools = value ?? [];

  return (
    <div className="space-y-2">
      <span className="mb-2 block font-medium text-slate-700 select-none">Tools</span>

      {tools.length > 0 && (
        <div className="space-y-3">
          {tools.map((tool, index) => (
            <ToolEditorCard
              key={index}
              tool={tool}
              onChange={(nextTool) =>
                onChange(
                  tools.map((current, currentIndex) =>
                    currentIndex === index ? nextTool : current,
                  ),
                )
              }
              onRemove={() => onChange(tools.filter((_, currentIndex) => currentIndex !== index))}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange([...tools, createEmptyTool()])}
        className={cn(
          "flex w-full cursor-pointer items-center justify-center gap-1 rounded-sm p-2 text-xs font-medium hover:bg-violet-100 hover:text-violet-700",
          tools.length === 0 && "bg-slate-100",
        )}
      >
        <PlusIcon weight="bold" className="size-3" />
        Add tool
      </button>
    </div>
  );
}
