import { ClockUserIcon } from "@phosphor-icons/react";

export function ScheduleCallbackInspector() {
  return (
    <section className="space-y-3 p-3 text-sm">
      <h3 className="flex items-center gap-2 text-base font-medium text-slate-800">
        <ClockUserIcon weight="duotone" className="size-5" />
        Schedule Callback
      </h3>
      <p className="text-slate-600">
        This is a virtual node. Configuration for callback scheduling is not available yet.
      </p>
    </section>
  );
}
