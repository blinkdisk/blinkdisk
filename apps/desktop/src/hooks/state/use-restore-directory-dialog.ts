import { CoreBackupItem } from "@desktop/hooks/queries/core/use-backup-list";
import { FolderItem } from "@desktop/hooks/use-folder-list";
import { atom, useAtom } from "jotai";

type RestoreDirectoryDialogOptions = {
  directoryId: string;
  folder: FolderItem | undefined;
  backup: CoreBackupItem | undefined;
  path: { objectId: string; name: string }[] | undefined;
};

const isOpenAtom = atom(false);
const optionsAtom = atom<RestoreDirectoryDialogOptions | null>(null);

export function useRestoreDirectoryDialog() {
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const [options, setOptions] = useAtom(optionsAtom);

  function openRestoreDirectory(options: RestoreDirectoryDialogOptions) {
    setOptions(options);
    setIsOpen(true);
  }

  return {
    isOpen,
    setIsOpen,
    openRestoreDirectory,
    options,
  };
}
