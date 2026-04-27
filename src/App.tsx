import { BracketsCurlyIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { FlowChart } from "./flow-chart";
import type { Script } from "./flow-chart/data-model";
import { sampleScript } from "./sample-script";

function App() {
  const [model, setModel] = useState<Script>(sampleScript);

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-slate-100 text-slate-700">
      <FlowChart className="size-full" model={model} onChange={setModel} />

      <button
        popoverTarget="data-model"
        className="absolute inset-e-2 bottom-2 flex cursor-pointer items-center gap-1 rounded-xs bg-slate-700 px-4 py-1 text-sm font-medium text-slate-100 hover:bg-slate-800 active:scale-95"
      >
        <BracketsCurlyIcon weight="bold" />
        JSON
      </button>
      <div
        id="data-model"
        popover="auto"
        className="fixed inset-1/2 h-[80%] w-[80%] max-w-6xl -translate-1/2 overflow-clip rounded-md border border-slate-300 bg-slate-50 backdrop:bg-slate-800/20"
      >
        <header className="border-b border-slate-200 px-4 py-3">
          <h1 className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            JSON Config
          </h1>
        </header>
        <pre className="max-h-full min-h-0 flex-1 overflow-auto p-4 pb-16 text-xs leading-4 tracking-tight text-slate-600">
          {JSON.stringify(model, null, 2)}
        </pre>
      </div>
    </main>
  );
}

export default App;
