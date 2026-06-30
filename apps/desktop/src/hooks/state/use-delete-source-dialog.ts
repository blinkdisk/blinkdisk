import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { Store, useStore } from "@tanstack/react-store";

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

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openDeleteSourceDialog(options: DeleteSourceDialogOptions) {
  store.setState(() => ({
    isOpen: true,
    options,
  }));
}

export function useDeleteSourceDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openDeleteSourceDialog,
    options,
  };
}
