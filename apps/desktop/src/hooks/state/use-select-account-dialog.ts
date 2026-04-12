import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type SelectAccountDialogOptions = {
  onSelect: (accountId: string) => void;
  showLocal?: boolean;
};

const store = new Store<{
  isOpen: boolean;
  options: SelectAccountDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useSelectAccountDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openSelectAccountDialog(options: SelectAccountDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openSelectAccountDialog,
    options,
  };
}
