import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

const store = new Store(false);

export function useNoStorageDialog() {
  const isOpen = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState(to);
  }, []);

  const openNoStorageDialog = useCallback(() => {
    store.setState(true);
  }, []);

  return {
    isOpen,
    setIsOpen,
    openNoStorageDialog,
  };
}
