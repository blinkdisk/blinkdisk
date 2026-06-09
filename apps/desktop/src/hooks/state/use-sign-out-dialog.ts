import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

const store = new Store<{
  isOpen: boolean;
}>({
  isOpen: false,
});

export function useSignOutDialog() {
  const { isOpen } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openSignOutDialog() {
    store.setState({
      isOpen: true,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openSignOutDialog,
  };
}
