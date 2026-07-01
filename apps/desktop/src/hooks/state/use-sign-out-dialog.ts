import { Store, useStore } from "@tanstack/react-store";

const store = new Store<{
  isOpen: boolean;
}>({
  isOpen: false,
});

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openSignOutDialog() {
  store.setState(() => ({
    isOpen: true,
  }));
}

export function useSignOutDialog() {
  const { isOpen } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openSignOutDialog,
  };
}
