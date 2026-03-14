import { CoreBackupItem } from "@desktop/hooks/queries/core/use-backup-list";
import { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type RestoreDirectoryDialogOptions = {
  directoryId: string;
  folder: CoreFolderItem | undefined;
  backup: CoreBackupItem | undefined;
  path: { objectId: string; name: string }[] | undefined;
};

const store = new Store<{
  isOpen: boolean;
  options: RestoreDirectoryDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useRestoreDirectoryDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openRestoreDirectory(options: RestoreDirectoryDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openRestoreDirectory,
    options,
  };
}
