import { Store, useStore } from "@tanstack/react-store";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

const store = new Store(false);

export function useUpgradeDialog() {
  const posthog = usePostHog();

  const isOpen = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState(to);
  }, []);

  function openUpgradeDialog() {
    posthog.capture("upgrade_show");

    store.setState(true);
  }

  return {
    isOpen,
    setIsOpen,
    openUpgradeDialog,
  };
}
