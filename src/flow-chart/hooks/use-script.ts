import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useSyncExternalStore } from "react";
import type { Script } from "../data-model";
import { useLatest } from "./use-latest";
import type { FlowSelection } from "./use-flow-selection";

type ScriptStore = {
  get: () => Script;
  set: Dispatch<SetStateAction<Script>>;
  subscribe: (listener: () => void) => () => void;
  select: (selection: FlowSelection | null) => void;
};

const ScriptStoreContext = createContext<ScriptStore | null>(null);

export const ScriptStoreProvider = ScriptStoreContext.Provider;

export function useScript(selector: undefined): Script;
export function useScript<T>(selector: (script: Script) => T): T;
export function useScript<T>(selector?: (script: Script) => T) {
  const store = useContext(ScriptStoreContext)!;
  return useSyncExternalStore(store.subscribe, () =>
    selector ? selector(store.get()) : store.get(),
  );
}

export function useScriptStore() {
  return useContext(ScriptStoreContext)!;
}

export function useCreateScriptStore(
  model: Script,
  onChange: Dispatch<SetStateAction<Script>>,
  select: (selection: FlowSelection | null) => void,
): ScriptStore {
  const modelRef = useLatest(model);
  const listenersRef = useRef(new Set<() => void>());

  return useMemo<ScriptStore>(
    () => ({
      get: () => modelRef.current,
      set: (next) => {
        onChange(next);
        listenersRef.current.forEach((l) => l());
      },
      subscribe: (listener) => {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
      select,
    }),
    [onChange],
  );
}
