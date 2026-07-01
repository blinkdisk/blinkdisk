import { Store, useStore } from "@tanstack/react-store";
import { usePostHog } from "posthog-js/react";

const store = new Store(false);

function setIsOpen(to: boolean) {
  store.setState(() => to);
}

export function useUpgradeDialog() {
  const posthog = usePostHog();

  const isOpen = useStore(store);

  function openUpgradeDialog() {
    posthog.capture("upgrade_show");

    store.setState(() => true);
  }

  return {
    isOpen,
    setIsOpen,
    openUpgradeDialog,
  };
}
