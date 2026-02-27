import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type TaskDialogOptions = {
  taskId: string;
};

const store = new Store<{
  isOpen: boolean;
  options: TaskDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useTaskDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openTaskDialog(options: TaskDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openTaskDialog,
    options,
  };
}
