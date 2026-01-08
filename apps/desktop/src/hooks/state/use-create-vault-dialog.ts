import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

const store = new Store(false);

export function useCreateVaultDialog() {
  const isOpen = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState(to);
  }, []);

  function openCreateVault() {
    store.setState(true);
  }

  return {
    isOpen,
    setIsOpen,
    openCreateVault,
  };
}
