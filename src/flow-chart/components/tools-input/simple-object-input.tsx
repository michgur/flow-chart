import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { cn } from "../../lib/utils";
import { entriesToRows, rowsToEntries, type EntryRow } from "./tools-input-utils";

type SimpleObjectInputProps = {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
};

export function SimpleObjectInput({ value, onChange }: SimpleObjectInputProps) {
  const [rows, setRows] = useState<EntryRow[]>(() => entriesToRows(value));

  useEffect(() => setRows(entriesToRows(value)), [value]);

  const updateRows = (nextRows: EntryRow[]) => {
    setRows(nextRows);
    onChange(rowsToEntries(nextRows));
  };

  return (
    <div className="space-y-2">
      {rows.length > 0 && (
        <div className="space-y-2 rounded-sm border border-slate-200 bg-slate-100 p-2">
          {rows.map((row, index) => (
            <div key={row.id} className="flex items-start gap-2">
              <input
                value={row.key}
                onChange={(event) =>
                  updateRows(
                    rows.map((current, currentIndex) =>
                      currentIndex === index ? { ...current, key: event.target.value } : current,
                    ),
                  )
                }
                placeholder="key"
                className="w-1/3 min-w-24 rounded-sm bg-white/70 px-2 py-1.5 text-slate-900 outline-emerald-500 focus:outline-2"
              />

              <input
                value={row.value}
                onChange={(event) =>
                  updateRows(
                    rows.map((current, currentIndex) =>
                      currentIndex === index ? { ...current, value: event.target.value } : current,
                    ),
                  )
                }
                placeholder="value"
                className="min-w-0 flex-1 rounded-sm bg-white/70 px-2 py-1.5 font-mono text-xs text-slate-900 outline-emerald-500 focus:outline-2"
              />

              <button
                type="button"
                onClick={() => updateRows(rows.filter((_, currentIndex) => currentIndex !== index))}
                aria-label={`Remove row ${index + 1}`}
                className="cursor-pointer rounded-sm p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-700"
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => updateRows([...rows, { id: crypto.randomUUID(), key: "", value: "" }])}
        className={cn(
          "flex w-full cursor-pointer items-center justify-center gap-1 rounded-sm p-2 text-xs font-medium hover:bg-violet-100 hover:text-violet-700",
          rows.length === 0 && "bg-slate-100",
        )}
      >
        <PlusIcon weight="bold" className="size-3" />
        Add value
      </button>
    </div>
  );
}
