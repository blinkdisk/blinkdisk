import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type DeleteSourceDialogOptions = {
  sourceId: string;
  profile?: SelectedProfile;
};

const store = new Store<{
  isOpen: boolean;
  options: DeleteSourceDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useDeleteSourceDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openDeleteSourceDialog(options: DeleteSourceDialogOptions) {
    store.setState(() => ({
      isOpen: true,
      options,
    }));
  }

  return {
    isOpen,
    setIsOpen,
    openDeleteSourceDialog,
    options,
  };
}
