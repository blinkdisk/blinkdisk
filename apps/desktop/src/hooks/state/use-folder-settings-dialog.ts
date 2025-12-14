import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type FolderSettingsDialogOptions = {
  folderId: string;
};

const store = new Store<{
  isOpen: boolean;
  options: FolderSettingsDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useFolderSettingsDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openFolderSettings(options: FolderSettingsDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openFolderSettings,
    options,
  };
}
