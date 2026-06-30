import type { CoreBackupItem } from "@desktop/hooks/queries/core/use-backup-list";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { Store, useStore } from "@tanstack/react-store";

type RestoreDirectoryDialogOptions = {
  directoryId: string;
  source: CoreSourceItem | undefined;
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

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openRestoreDirectory(options: RestoreDirectoryDialogOptions) {
  store.setState(() => ({
    isOpen: true,
    options,
  }));
}

export function useRestoreDirectoryDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openRestoreDirectory,
    options,
  };
}
