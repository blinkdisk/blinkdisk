import { Store, useStore } from "@tanstack/react-store";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

type AuthPage = NonNullable<Parameters<typeof window.electron.auth.open>[0]>;

const store = new Store<{
  isOpen: boolean;
  browserFailed: boolean;
  page: AuthPage;
}>({
  isOpen: false,
  browserFailed: false,
  page: "register",
});

let authAttempt = 0;

export function useAuthDialog() {
  const { isOpen, browserFailed, page } = useStore(store);
  const posthog = usePostHog();

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
      browserFailed: to ? state.browserFailed : false,
    }));
  }, []);

  async function openAuthDialog(page: AuthPage = "register") {
    const attempt = ++authAttempt;
    store.setState(() => ({
      isOpen: true,
      browserFailed: false,
      page,
    }));

    try {
      await window.electron.auth.open(page);
    } catch (error) {
      console.error("Failed to open sign-in browser", error);
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
    page,
    setIsOpen,
    openAuthDialog,
  };
}
