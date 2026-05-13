import Editor, { type Monaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";

type JsonFallbackInputProps<T> = {
  title: string;
  value: T;
  onChange: (value: T) => void;
};

export function JsonFallbackInput<T>({ title, value, onChange }: JsonFallbackInputProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(JSON.stringify(value, null, 2));
    setError(null);
  }, [open, value]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-sm px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-700"
      >
        Advanced JSON
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/30 p-4">
          <div className="nodrag nopan flex h-[70vh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-slate-300 bg-slate-50 shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h1 className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                {title}
              </h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer rounded-sm px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      onChange(JSON.parse(draft) as T);
                      setOpen(false);
                    } catch {
                      setError("Invalid JSON");
                    }
                  }}
                  className="cursor-pointer rounded-sm bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-800"
                >
                  Apply
                </button>
              </div>
            </header>

            {error && (
              <p className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
                {error}
              </p>
            )}

            <div className="min-h-0 flex-1">
              <Editor
                beforeMount={configureMonaco}
                language="json"
                path={`tool-json-${title}.json`}
                value={draft}
                onChange={(nextValue) => {
                  setDraft(nextValue ?? "");
                  setError(null);
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function configureMonaco(monaco: Monaco) {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
  });
}
