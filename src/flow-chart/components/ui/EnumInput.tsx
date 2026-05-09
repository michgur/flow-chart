import { Combobox } from "@base-ui/react/combobox";
import { XIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";

type EnumInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

export function EnumInput({
  value,
  onChange,
  placeholder = "Type option, press ⏎",
}: EnumInputProps) {
  const helperId = useId();
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const option = input.trim().replace(/\s{2,}/g, " ");
  const exists = value.some(
    (item) => item.toLowerCase() === option.toLowerCase(),
  );

  function addOption(raw: string) {
    const option = raw.trim().replace(/\s{2,}/g, " ");
    if (!option) return;

    const exists = value.some(
      (item) => item.toLowerCase() === option.toLowerCase(),
    );
    if (exists) return;

    onChange([...value, option]);
    setInput("");
  }

  return (
    <Combobox.Root<string, true>
      items={value}
      multiple
      value={value}
      onValueChange={(next) => onChange(next)}
      inputValue={input}
      onInputValueChange={setInput}
    >
      <div className="space-y-1">
        <Combobox.InputGroup className="cursor-text rounded-sm bg-slate-100 px-1 py-1.5 outline-emerald-500 has-[input:focus]:outline-2">
          <Combobox.Chips className="flex h-full flex-wrap items-center gap-1">
            <Combobox.Value>
              {(selected: string[]) => (
                <>
                  <Combobox.Input
                    placeholder={selected.length > 0 ? "" : placeholder}
                    aria-describedby={focused ? helperId : undefined}
                    onFocus={() => setFocused(true)}
                    onKeyDown={(event) => {
                      if (["Enter", "Tab", ","].includes(event.key)) {
                        event.preventBaseUIHandler();
                        addOption(input);
                      }
                    }}
                    onBlur={() => {
                      addOption(input);
                      setFocused(false);
                    }}
                    className="order-last flex-1 bg-transparent ps-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  {selected.map((option) => (
                    <Combobox.Chip
                      key={option}
                      className="flex max-w-full cursor-default items-center gap-1 rounded-xs bg-blue-100 p-0.5 ps-1.5 text-sm text-blue-800 outline-emerald-500 focus:outline-2"
                      aria-label={option}
                    >
                      <span className="truncate">{option}</span>
                      <Combobox.ChipRemove
                        className="cursor-pointer rounded-full p-0.5 text-blue-700 opacity-30 hover:bg-blue-200 hover:opacity-100"
                        aria-label={`Remove ${option}`}
                      >
                        <XIcon weight="bold" className="size-3" />
                      </Combobox.ChipRemove>
                    </Combobox.Chip>
                  ))}
                </>
              )}
            </Combobox.Value>
          </Combobox.Chips>
        </Combobox.InputGroup>
        {focused && (
          <p id={helperId} className="px-1 text-xs text-slate-400">
            {option
              ? exists
                ? `"${option}" is already added`
                : `Press ⏎ to add "${option}"`
              : "Type an option, then press ⏎"}
          </p>
        )}
      </div>
    </Combobox.Root>
  );
}
