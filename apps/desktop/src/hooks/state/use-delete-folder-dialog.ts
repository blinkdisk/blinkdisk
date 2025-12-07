import { atom, useAtom } from "jotai";

type DeleteFolderDialogOptions = {
  folderId: string;
};

const isOpenAtom = atom(false);
const optionsAtom = atom<DeleteFolderDialogOptions | null>(null);

export function useDeleteFolderDialog() {
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const [options, setOptions] = useAtom(optionsAtom);

  function openDeleteFolderDialog(options: DeleteFolderDialogOptions) {
    setOptions(options);
    setIsOpen(true);
  }

  return {
    isOpen,
    setIsOpen,
    openDeleteFolderDialog,
    options,
  };
}
