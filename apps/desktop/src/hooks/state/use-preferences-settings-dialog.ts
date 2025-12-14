import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

const store = new Store(false);

export function usePreferencesSettingsDialog() {
  const isOpen = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState(to);
  }, []);

  function openPreferencesSettings() {
    store.setState(true);
  }

  return {
    isOpen,
    setIsOpen,
    openPreferencesSettings,
  };
}
