import { Store, useStore } from "@tanstack/react-store";

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

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openSelectAccountDialog(options: SelectAccountDialogOptions) {
  store.setState(() => ({
    isOpen: true,
    options,
  }));
}

export function useSelectAccountDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openSelectAccountDialog,
    options,
  };
}
