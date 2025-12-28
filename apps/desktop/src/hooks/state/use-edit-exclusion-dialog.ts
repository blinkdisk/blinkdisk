import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type EditExclusionDialogOptions = {
  initialValue: string;
  onSave: (update: string) => void;
};

const store = new Store<{
  isOpen: boolean;
  options: EditExclusionDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useEditExclusionDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openEditExclusionDialog(options: EditExclusionDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openEditExclusionDialog,
    options,
  };
}
