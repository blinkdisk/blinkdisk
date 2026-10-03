import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

const store = new Store<{
  isOpen: boolean;
}>({
  isOpen: false,
});
let authOpenAttempt = 0;

export function useAuthDialog() {
  const { isOpen } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openAuthDialog() {
    const attempt = ++authOpenAttempt;
    store.setState(() => ({
      isOpen: true,
    }));
    void window.electron.auth.open().catch((error: unknown) => {
      console.error("Failed to open sign-in browser", error);
      if (attempt !== authOpenAttempt) return;
      setIsOpen(false);
      showErrorToast(new CustomError("AUTH_OPEN_FAILED"));
    });
  }

  return {
    isOpen,
    setIsOpen,
    openAuthDialog,
  };
}
