import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

const store = new Store(false);

export function useAccountSettingsDialog() {
  const isOpen = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState(to);
  }, []);

  function openAccountSettings() {
    store.setState(true);
  }

  return {
    isOpen,
    setIsOpen,
    openAccountSettings,
  };
}
