import { Store, useStore } from "@tanstack/react-store";

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

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openTaskDialog(options: TaskDialogOptions) {
  store.setState(() => ({
    isOpen: true,
    options,
  }));
}

export function useTaskDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openTaskDialog,
    options,
  };
}
