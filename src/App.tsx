import { useEffect, useState } from "react";

import { FlowChart } from "./flow-chart";
import { sanitizeScript } from "./flow-chart/adapters";
import { ComboboxSelect } from "./flow-chart/components/ui/ComboboxSelect";
import type { Script } from "./flow-chart/data-model";
import { JsonEditor } from "./JsonEditor";

function App() {
  const [model, setModel] = useState<Script>({ goals: [] });
  const [sample, setSample] = useState<string | null>(null);

  useEffect(() => {
    if (sample)
      void import(`./sample-scripts/${sample}.json`).then((s) =>
        setModel(sanitizeScript(s)),
      );
  }, [sample]);

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-slate-100 text-slate-700">
      <FlowChart className="size-full" model={model} onChange={setModel} />

      <menu className="absolute inset-e-2 bottom-2 flex items-stretch gap-2 text-sm font-medium">
        <ComboboxSelect
          className="w-42 rounded-xs bg-slate-700! px-2 outline-none [&_input]:text-slate-100"
          value={sample}
          onChange={setSample}
          options={[
            { label: "amanda-2", value: "amanda-2" },
            { label: "amanda-3", value: "amanda-3" },
            { label: "warranty-first", value: "warranty-first" },
          ]}
        />
        <JsonEditor model={model} onChange={setModel} />
      </menu>
    </main>
  );
}

export default App;
