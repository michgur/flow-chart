import Editor, { type Monaco } from "@monaco-editor/react";
import { BracketsCurlyIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { sanitizeScript, scriptToFlowModel } from "./flow-chart/adapters";
import type { Script } from "./flow-chart/data-model";

type JsonEditorProps = {
  model: Script;
  onChange: (model: Script) => void;
};

type JsonEditorStatus =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const POPUP_ID = "data-model";

export function JsonEditor({ model, onChange }: JsonEditorProps) {
  const [draft, setDraft] = useState(() => JSON.stringify(model, null, 2));
  const [status, setStatus] = useState<JsonEditorStatus>({ type: "idle" });
  const [hasOpenedEditor, setHasOpenedEditor] = useState(false);

  function configureMonaco(monaco: Monaco) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
    });
  }

  function openEditor() {
    setDraft(JSON.stringify(model, null, 2));
    setStatus({ type: "idle" });
    setHasOpenedEditor(true);
  }

  function handleUpdate() {
    try {
      const parsed = JSON.parse(draft);
      const nextModel = sanitizeScript(parsed);
      scriptToFlowModel(nextModel);
      onChange(nextModel);
      setStatus({ type: "success", message: "Updated successfully." });
    } catch (error) {
      console.error("Failed to update JSON config", error);
      setStatus({
        type: "error",
        message: "Update failed. Open console for details.",
      });
    }
  }

  return (
    <>
      <button
        popoverTarget={POPUP_ID}
        onClick={openEditor}
        className="flex cursor-pointer items-center gap-1 rounded-xs bg-slate-700 px-4 py-1 text-slate-100 hover:bg-slate-800 active:scale-95"
      >
        <BracketsCurlyIcon weight="bold" />
        JSON
      </button>

      <div
        id={POPUP_ID}
        popover="auto"
        className="fixed inset-1/2 h-[80%] w-[80%] max-w-6xl -translate-1/2 flex-col overflow-clip rounded-md border border-slate-300 bg-slate-50 backdrop:bg-slate-800/20 open:flex"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h1 className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            JSON Config
          </h1>
          <button
            type="button"
            onClick={handleUpdate}
            className="cursor-pointer rounded-xs bg-slate-700 px-3 py-1 text-xs font-semibold tracking-wide text-slate-100 uppercase hover:bg-slate-800 active:scale-95"
          >
            Update
          </button>
        </header>

        {status.type !== "idle" && (
          <p
            className={`border-b px-4 py-2 text-xs ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {status.message}
          </p>
        )}

        <div className="min-h-0 w-full flex-1">
          {hasOpenedEditor && (
            <Editor
              beforeMount={configureMonaco}
              height="100%"
              theme="vs"
              path="flow-chart.json"
              language="json"
              value={draft}
              onChange={(value) => {
                setDraft(value ?? "");
                setStatus({ type: "idle" });
              }}
              options={{
                minimap: { enabled: false },
                wordWrap: "on",
                tabSize: 2,
                insertSpaces: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                fontSize: 12,
                lineHeight: 16,
              }}
              loading={<div className="p-4 text-xs text-slate-500">Loading editor...</div>}
            />
          )}
        </div>
      </div>
    </>
  );
}
