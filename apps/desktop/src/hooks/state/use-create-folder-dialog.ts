import { atom, useAtom } from "jotai";

const createFolderAtom = atom(false);

export function useCreateFolderDialog() {
  const [isOpen, setIsOpen] = useAtom(createFolderAtom);

  function openCreateFolder() {
    setIsOpen(true);
  }

  return {
    isOpen,
    setIsOpen,
    openCreateFolder,
  };
}
