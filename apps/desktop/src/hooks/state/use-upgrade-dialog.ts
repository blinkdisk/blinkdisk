import { atom, useAtom } from "jotai";
import { usePostHog } from "posthog-js/react";

const upgradeAtom = atom(false);

export function useUpgradeDialog() {
  const posthog = usePostHog();

  const [isOpen, setIsOpen] = useAtom(upgradeAtom);

  function openUpgradeDialog() {
    posthog.capture("upgrade_show");

    setIsOpen(true);
  }

  return {
    isOpen,
    setIsOpen,
    openUpgradeDialog,
  };
}
