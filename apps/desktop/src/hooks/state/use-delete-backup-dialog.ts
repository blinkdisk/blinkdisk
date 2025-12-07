import { atom, useAtom } from "jotai";

type DeleteBackupDialogOptions = {
  backupId: string;
};

const isOpenAtom = atom(false);
const optionsAtom = atom<DeleteBackupDialogOptions | null>(null);

export function useDeleteBackupDialog() {
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const [options, setOptions] = useAtom(optionsAtom);

  function openDeleteBackupDialog(options: DeleteBackupDialogOptions) {
    setOptions(options);
    setIsOpen(true);
  }

  return {
    isOpen,
    setIsOpen,
    openDeleteBackupDialog,
    options,
  };
}
