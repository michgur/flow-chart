import { Combobox } from "@base-ui/react/combobox";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { cn } from "../../lib/utils";

export type ComboboxSelectOption<Value extends string> = {
  value: Value;
  label: string;
};

type ComboboxSelectProps<Value extends string> = {
  value: Value | null;
  onChange: (value: Value) => void;
  options: readonly ComboboxSelectOption<Value>[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
};

export function ComboboxSelect<Value extends string>({
  value,
  onChange,
  options,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  className,
}: ComboboxSelectProps<Value>) {
  const selected = options.find((option) => option.value === value) ?? null;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(selected?.label ?? "");

  useEffect(() => {
    if (!open) setInput(selected?.label ?? "");
  }, [open, selected?.label]);

  return (
    <Combobox.Root<ComboboxSelectOption<Value>>
      autoHighlight
      items={options}
      value={selected}
      open={open}
      inputValue={input}
      onOpenChange={(open) => {
        setOpen(open);
        setInput(open ? "" : (selected?.label ?? ""));
      }}
      onInputValueChange={setInput}
      onValueChange={(option) => {
        if (!option) return;

        setInput(option.label);
        onChange(option.value);
      }}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
      isItemEqualToValue={(option, selected) => option.value === selected.value}
    >
      <Combobox.InputGroup
        className={cn(
          "relative rounded-sm bg-slate-100 outline-emerald-500 focus-within:bg-slate-50 focus-within:outline-2",
          className,
        )}
      >
        <Combobox.Input
          placeholder={open ? searchPlaceholder : placeholder}
          className="w-full rounded-sm bg-transparent py-1.5 ps-2 pe-8 text-sm font-medium text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400"
        />
        <Combobox.Trigger
          className="absolute inset-y-0 inset-e-1 flex cursor-pointer items-center rounded-xs px-1 text-slate-400 outline-none hover:text-slate-600 focus-visible:text-slate-700 active:scale-95"
          aria-label="Open options"
        >
          <Combobox.Icon>
            <CaretDownIcon weight="bold" className="size-3.5" />
          </Combobox.Icon>
        </Combobox.Trigger>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner className="z-50 outline-none" align="start" sideOffset={4}>
          <Combobox.Popup className="nodrag nopan transition-transform,scale,opacity w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <Combobox.Empty>
              <div className="px-3 py-2 text-slate-400">No options found</div>
            </Combobox.Empty>
            <Combobox.List className="max-h-52 overflow-y-auto p-0.5 outline-none">
              {(option: ComboboxSelectOption<Value>) => (
                <Combobox.Item
                  key={option.value}
                  value={option}
                  className="flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1.5 outline-none select-none data-highlighted:bg-slate-200 data-highlighted:font-medium data-highlighted:text-slate-800"
                >
                  <span className="grow">{option.label}</span>
                  <Combobox.ItemIndicator className="text-emerald-600 data-highlighted:text-slate-50">
                    <CheckIcon weight="bold" className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
