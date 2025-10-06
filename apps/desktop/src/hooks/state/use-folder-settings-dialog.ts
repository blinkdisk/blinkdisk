import { atom, useAtom } from "jotai";

const isOpenAtom = atom(false);

export function useFolderSettingsDialog() {
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);

  function openFolderSettings() {
    setIsOpen(true);
  }

  return {
    isOpen,
    setIsOpen,
    openFolderSettings,
  };
}
