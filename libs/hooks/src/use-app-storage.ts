import { ElectronAPI } from "@electron/preload";
import { GlobalStorageSchema } from "@electron/store";
import { useEffect, useState } from "react";
import {
  STORAGE_CHANGE_EVENT,
  StorageEventManager,
} from "./storage-event-manager";

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

const isElectron = typeof window !== "undefined" && "electron" in window;

const getStorageValue = <K extends keyof GlobalStorageSchema>(
  key: K,
  defaultValue?: GlobalStorageSchema[K],
): GlobalStorageSchema[K] | undefined => {
  if (typeof window === "undefined") return defaultValue;

  if (isElectron) {
    return (
      (window.electron!.store.get(key) as GlobalStorageSchema[K] | undefined) ||
      defaultValue
    );
  }

  const item = localStorage.getItem(key as string);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageValue = async <K extends keyof GlobalStorageSchema>(
  key: K,
  value: GlobalStorageSchema[K],
): Promise<void> => {
  if (typeof window === "undefined") return;

  if (isElectron) {
    await window.electron!.store.set(key, value);
  } else {
    localStorage.setItem(key as string, JSON.stringify(value));
  }

  window.dispatchEvent(
    new CustomEvent(STORAGE_CHANGE_EVENT, {
      detail: { key, value },
    }),
  );
};

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
  const [state, setState] = useState<GlobalStorageSchema[K] | undefined>(
    getStorageValue(key, defaultValue),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    setState(getStorageValue(key, defaultValue));

    const unsubscribe = StorageEventManager.subscribe(() => {
      setState(getStorageValue(key, defaultValue));
    });

    return () => {
      unsubscribe();
    };
  }, [key, defaultValue]);

  async function setValue(value: GlobalStorageSchema[K]) {
    if (value !== undefined) await setStorageValue(key, value);
    setState(value);
  }

  return [state, setValue];
}
