import type { ZCreateSourceFormType } from "@blinkdisk/schemas/source";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

const store = new Store<{
  isOpen: boolean;
  defaultValues: Partial<ZCreateSourceFormType> | null;
}>({
  isOpen: false,
  defaultValues: null,
});

export function useCreateSourceDialog() {
  const { isOpen, defaultValues } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openCreateSource(values?: Partial<ZCreateSourceFormType>) {
    store.setState(() => ({
      isOpen: true,
      defaultValues: values || null,
    }));
  }

  function clearDefaultValues() {
    store.setState((state) => ({
      ...state,
      defaultValues: null,
    }));
  }

  return {
    isOpen,
    setIsOpen,
    defaultValues,
    openCreateSource,
    clearDefaultValues,
  };
}
