import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

const store = new Store<{
  isOpen: boolean;
}>({
  isOpen: false,
});

export function useAuthDialog() {
  const { isOpen } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openAuthDialog() {
    store.setState(() => ({
      isOpen: true,
    }));
    void window.electron.auth.open().catch(() => {
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
