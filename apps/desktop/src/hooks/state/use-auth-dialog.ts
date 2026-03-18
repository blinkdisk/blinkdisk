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
    store.setState({
      isOpen: true,
    });
    window.electron.auth.open();
  }

  return {
    isOpen,
    setIsOpen,
    openAuthDialog,
  };
}
