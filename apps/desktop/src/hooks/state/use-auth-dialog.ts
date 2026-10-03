import { Store, useStore } from "@tanstack/react-store";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

const store = new Store<{
  isOpen: boolean;
  browserFailed: boolean;
}>({
  isOpen: false,
  browserFailed: false,
});

let authAttempt = 0;

export function useAuthDialog() {
  const { isOpen, browserFailed } = useStore(store);
  const posthog = usePostHog();

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
      browserFailed: to ? state.browserFailed : false,
    }));
  }, []);

  async function openAuthDialog() {
    const attempt = ++authAttempt;
    store.setState(() => ({
      isOpen: true,
      browserFailed: false,
    }));

    try {
      await window.electron.auth.open();
    } catch {
      if (attempt === authAttempt) {
        store.setState((state) =>
          state.isOpen ? { ...state, browserFailed: true } : state,
        );
      }
      posthog.capture("auth_open_failed");
    }
  }

  return {
    isOpen,
    browserFailed,
    setIsOpen,
    openAuthDialog,
  };
}
