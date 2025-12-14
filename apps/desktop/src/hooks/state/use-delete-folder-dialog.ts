import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type DeleteFolderDialogOptions = {
  folderId: string;
};

const store = new Store<{
  isOpen: boolean;
  options: DeleteFolderDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useDeleteFolderDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openDeleteFolderDialog(options: DeleteFolderDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openDeleteFolderDialog,
    options,
  };
}
