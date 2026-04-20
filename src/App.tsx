import { useState } from "react";
import type { Script } from "./data-model";
import { FlowChart } from "./flow-chart";

const initialModel: Script = {
  goals: [
    {
      name: "Start",
      transitions: [
        { target: "Collect details", conditions: "customer says hello" },
      ],
    },
    {
      name: "Collect details",
      transitions: [
        { target: "Done", prompt: "Summarize details and confirm" },
      ],
    },
    {
      name: "Done",
      transitions: [],
    },
  ],
  transitions: [{ target: "Done", prompt: "End conversation politely" }],
};

function App() {
  const [model, setModel] = useState<Script>(initialModel);

  return (
    <main className="h-screen bg-slate-100 text-slate-700 flex">
      <section className="overflow-hidden grow">
        <FlowChart model={model} onModelChange={setModel} />
      </section>

      <aside className="flex min-h-0 flex-col bg-slate-50 border-s border-slate-200">
        <header className="border-b border-slate-200 px-4 py-3">
          <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Data model
          </h1>
        </header>
        <pre className="min-h-0 flex-1 overflow-auto p-4 text-xs leading-4 text-slate-600 tracking-tight">
          {JSON.stringify(model, null, 2)}
        </pre>
      </aside>
    </main>
  );
}

export default App;
