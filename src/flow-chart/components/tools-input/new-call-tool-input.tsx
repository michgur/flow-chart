import type { NewCallConfig } from "../../data-model";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { normalizeNewCallConfig } from "./tools-input-utils";

type NewCallToolInputProps = {
  value: NewCallConfig;
  onChange: (value: NewCallConfig) => void;
};

export function NewCallToolInput({ value, onChange }: NewCallToolInputProps) {
  const next = normalizeNewCallConfig(value);

  return (
    <div className="space-y-2 rounded-sm border border-slate-200 bg-white/70 p-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="font-medium text-slate-700">Agent</span>
          <input
            value={next.agent}
            onChange={(event) => onChange({ ...next, agent: event.target.value })}
            placeholder="agent id"
            className="w-full rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 focus:bg-slate-50 focus:outline-2"
          />
        </label>

        <label className="space-y-1">
          <span className="font-medium text-slate-700">Phone number</span>
          <input
            value={next.phone_number}
            onChange={(event) => onChange({ ...next, phone_number: event.target.value })}
            placeholder="+15551234567"
            className="w-full rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 focus:bg-slate-50 focus:outline-2"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="font-medium text-slate-700">Pre-merge message</span>
        <AutoResizeTextarea
          name="tool-new-call-pre-merge"
          value={next.pre_merge_message ?? ""}
          onChange={(event) =>
            onChange({ ...next, pre_merge_message: event.target.value || undefined })
          }
          placeholder="Optional message before merge"
          className="w-full resize-none overflow-hidden rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 placeholder:text-slate-400 focus:bg-slate-50 focus:outline-2"
          spellCheck={true}
        />
      </label>

      <label className="block space-y-1">
        <span className="font-medium text-slate-700">Parent fail message</span>
        <AutoResizeTextarea
          name="tool-new-call-parent-fail"
          value={next.parent_fail_message ?? ""}
          onChange={(event) =>
            onChange({
              ...next,
              parent_fail_message: event.target.value || undefined,
            })
          }
          placeholder="Optional fallback message"
          className="w-full resize-none overflow-hidden rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 placeholder:text-slate-400 focus:bg-slate-50 focus:outline-2"
          spellCheck={true}
        />
      </label>

      <p className="text-xs text-slate-500">
        Static call fields are managed automatically and hidden here.
      </p>
    </div>
  );
}
