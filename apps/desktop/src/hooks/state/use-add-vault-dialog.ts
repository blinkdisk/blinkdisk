import { atom, useAtom } from "jotai";

const addVaultAtom = atom(false);

export function useAddVaultDialog() {
  const [isOpen, setIsOpen] = useAtom(addVaultAtom);

  function openAddVault() {
    setIsOpen(true);
  }

  return {
    isOpen,
    setIsOpen,
    openAddVault,
  };
}
