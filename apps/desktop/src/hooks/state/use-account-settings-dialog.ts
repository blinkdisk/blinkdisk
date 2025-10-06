import { atom, useAtom } from "jotai";

const accountSettingsAtom = atom(false);

export function useAccountSettingsDialog() {
  const [isOpen, setIsOpen] = useAtom(accountSettingsAtom);

  function openAccountSettings() {
    setIsOpen(true);
  }

  return {
    isOpen,
    setIsOpen,
    openAccountSettings,
  };
}
