import { Store, useStore } from "@tanstack/react-store";

const store = new Store<{
  isOpen: boolean;
  onAccountAdd?: (accountId: string) => void;
}>({
  isOpen: false,
});

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
    onAccountAdd: to ? state.onAccountAdd : undefined,
  }));
}

function openAuthDialog(options?: {
  onAccountAdd?: (accountId: string) => void;
}) {
  store.setState(() => ({
    isOpen: true,
    onAccountAdd: options?.onAccountAdd,
  }));
  window.electron.auth.open();
}

function completeAuthDialog(accountId: string) {
  const { onAccountAdd } = store.state;
  store.setState((state) => ({
    ...state,
    isOpen: false,
    onAccountAdd: undefined,
  }));
  onAccountAdd?.(accountId);
}

export function useAuthDialog() {
  const { isOpen } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openAuthDialog,
    completeAuthDialog,
  };
}
