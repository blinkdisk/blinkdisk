import { Store, useStore } from "@tanstack/react-store";

type DeleteVaultDialogOptions = {
  vaultId: string;
};

const store = new Store<{
  isOpen: boolean;
  options: DeleteVaultDialogOptions | null;
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

function openDeleteVaultDialog(options: DeleteVaultDialogOptions) {
  store.setState(() => ({
    isOpen: true,
    options,
  }));
}

export function useDeleteVaultDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openDeleteVaultDialog,
    options,
  };
}
