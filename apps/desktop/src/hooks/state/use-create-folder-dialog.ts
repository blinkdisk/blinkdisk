import type { ZCreateFolderFormType } from "@blinkdisk/schemas/folder";
import type { ProfileFilter } from "@desktop/hooks/use-profile";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type CreateFolderDialogOptions = {
  profileFilter?: ProfileFilter;
};

const store = new Store<{
  isOpen: boolean;
  defaultValues: Partial<ZCreateFolderFormType> | null;
  options: CreateFolderDialogOptions | null;
}>({
  isOpen: false,
  defaultValues: null,
  options: null,
});

export function useCreateFolderDialog() {
  const { isOpen, defaultValues, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openCreateFolder(
    values?: Partial<ZCreateFolderFormType>,
    options?: CreateFolderDialogOptions,
  ) {
    store.setState({
      isOpen: true,
      defaultValues: values || null,
      options: options || null,
    });
  }

  function clearDefaultValues() {
    store.setState((state) => ({
      ...state,
      defaultValues: null,
      options: null,
    }));
  }

  return {
    isOpen,
    setIsOpen,
    defaultValues,
    options,
    openCreateFolder,
    clearDefaultValues,
  };
}
