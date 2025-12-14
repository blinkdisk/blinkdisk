import { GlobalStorageSchema } from "@electron/store";
import { Store, useStore } from "@tanstack/react-store";
import { useEffect } from "react";

const store = new Store(window.electron.store.get() as any);

export function useAppStorage<K extends keyof GlobalStorageSchema>(
  key: K,
): [
  GlobalStorageSchema[K] | undefined,
  (value: GlobalStorageSchema[K]) => Promise<void>,
];
export function useAppStorage<K extends keyof GlobalStorageSchema>(
  key: K,
  defaultValue: GlobalStorageSchema[K],
): [GlobalStorageSchema[K], (value: GlobalStorageSchema[K]) => Promise<void>];
export function useAppStorage<K extends keyof GlobalStorageSchema>(
  key: K,
  defaultValue?: GlobalStorageSchema[K],
) {
  const state = useStore(store, (state) =>
    key === null ? null : key.split(".").reduce((o, i) => o[i], state),
  );

  async function setValue(value: GlobalStorageSchema[K]) {
    await window.electron.store.set(key, value);
  }

  return [state || defaultValue, setValue];
}

export function useStorageListener() {
  useEffect(() => {
    const unsubscribe = window.electron.store.change(() => {
      store.setState(window.electron.store.get());
    });

    return () => unsubscribe();
  }, []);
}
