import { ZCreateFolderFormType } from "@schemas/folder";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

const store = new Store<{
  isOpen: boolean;
  defaultValues: Partial<ZCreateFolderFormType> | null;
}>({
  isOpen: false,
  defaultValues: null,
});

export function useCreateFolderDialog() {
  const { isOpen, defaultValues } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openCreateFolder(values?: Partial<ZCreateFolderFormType>) {
    store.setState({
      isOpen: true,
      defaultValues: values || null,
    });
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
    openCreateFolder,
    clearDefaultValues,
  };
}
