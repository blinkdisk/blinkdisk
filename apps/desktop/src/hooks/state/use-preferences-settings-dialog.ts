import { atom, useAtom } from "jotai";

const preferencesSettingsAtom = atom(false);

export function usePreferencesSettingsDialog() {
  const [isOpen, setIsOpen] = useAtom(preferencesSettingsAtom);

  function openPreferencesSettings() {
    setIsOpen(true);
  }

  return {
    isOpen,
    setIsOpen,
    openPreferencesSettings,
  };
}
