import { Autocomplete, type AutocompleteRootChangeEventDetails } from "@base-ui/react";
import { useCallback, useState, type FocusEventHandler } from "react";

import {
  useConditionsSuggestions,
  type ConditionsSuggestion,
} from "../../hooks/use-conditions-suggestions";
import { cn } from "../../lib/utils";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

type ConditionInputProps = {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  defaultSuggestions?: ConditionsSuggestion[];
  onBlur?: FocusEventHandler<HTMLInputElement>;
  className?: string;
};

export function ConditionInput({
  value,
  onChange,
  className,
  name,
  onBlur,
  defaultSuggestions,
}: ConditionInputProps) {
  const suggestions = useConditionsSuggestions(value, defaultSuggestions);
  const [open, setOpen] = useState(false);

  const onValueChange = useCallback(
    (change: string, event: AutocompleteRootChangeEventDetails) =>
      onChange(event.reason === "item-press" ? acceptSuggestion(value, change) : change),
    [onChange, value],
  );

  return (
    <Autocomplete.Root<ConditionsSuggestion[]>
      autoHighlight="always"
      value={value}
      onValueChange={onValueChange}
      filteredItems={suggestions}
      open={open}
      onOpenChange={(open, evt) => {
        if (evt.reason === "item-press") evt.cancel();
        else setOpen(open);
      }}
    >
      <Autocomplete.Input
        render={(props) => <AutoResizeTextarea {...props} />}
        name={name}
        onFocus={() => setOpen(true)}
        onKeyDown={(evt) => {
          if (evt.key === "Enter" && !open) {
            evt.preventDefault();
          }
        }}
        onBlur={(evt) => {
          const trimmed = evt.currentTarget.value.trim();
          if (trimmed !== value) {
            onChange(trimmed);
          }
          onBlur?.(evt);
        }}
        placeholder="Write a condition..."
        className={cn(
          "w-full rounded-sm bg-slate-100 py-1.5 ps-2 pe-2 font-mono text-xs text-slate-800 outline-emerald-500 outline-none placeholder:text-slate-400 focus-within:bg-slate-50 focus-within:outline-2",
          className,
        )}
      />

      <Autocomplete.Portal>
        <Autocomplete.Positioner className="z-50 outline-none" align="start" sideOffset={4}>
          <Autocomplete.Popup
            className={cn(
              "nodrag nopan w-(--anchor-width) overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
              suggestions.length === 0 && "hidden",
            )}
          >
            <Autocomplete.List className="max-h-52 overflow-y-auto p-0.5 outline-none">
              {(sugg: (typeof suggestions)[number]) => (
                <Autocomplete.Item
                  key={sugg.value}
                  value={sugg.value}
                  className="cursor-pointer rounded-sm px-2 py-1.5 font-mono text-xs outline-none select-none data-highlighted:bg-slate-200 data-highlighted:text-slate-900"
                >
                  {sugg.label}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

function acceptSuggestion(value: string, suggestion: string): string {
  const words = value.split(/\s+/);
  const lastWord = words.pop();
  if (!lastWord) return `${value}${suggestion} `;
  let start = suggestion.startsWith(lastWord) ? words.filter(Boolean).join(" ") : value.trimEnd();
  if (start.length > 0) start = `${start} `;
  return `${start}${suggestion} `;
}
