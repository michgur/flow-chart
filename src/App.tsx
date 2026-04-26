import { useState } from "react";
import type { Script } from "./flow-chart/data-model";
import { FlowChart } from "./flow-chart";
import { BracketsCurlyIcon } from "@phosphor-icons/react";

const initialModel: Script = {
  goals: [
    {
      name: "start",
      nodeType: "say",
    },
    {
      name: "collect-details",
      nodeType: "say",
    },
    {
      name: "done",
      nodeType: "say",
    },
  ],
};

function App() {
  const [model, setModel] = useState<Script>(initialModel);

  return (
    <main className="h-dvh w-dvw relative bg-slate-100 text-slate-700 overflow-hidden">
      <FlowChart className="size-full" model={model} onChange={setModel} />

      <button
        popoverTarget="data-model"
        className="absolute px-4 py-1 flex gap-1 items-center text-sm rounded-xs bottom-2 inset-e-2 cursor-pointer bg-slate-700 hover:bg-slate-800 active:scale-95 text-slate-100 font-medium"
      >
        <BracketsCurlyIcon weight="bold" />
        JSON
      </button>
      <div
        id="data-model"
        popover="auto"
        className="bg-slate-50 border-slate-300 overflow-clip border rounded-md w-[80%] h-[80%] max-w-6xl fixed inset-1/2 -translate-1/2 backdrop:bg-slate-800/20"
      >
        <header className="border-b border-slate-200 px-4 py-3">
          <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            JSON Config
          </h1>
        </header>
        <pre className="flex-1 overflow-auto min-h-0 max-h-full p-4 pb-16 text-xs leading-4 text-slate-600 tracking-tight">
          {JSON.stringify(model, null, 2)}
        </pre>
      </div>
    </main>
  );
}

export default App;
