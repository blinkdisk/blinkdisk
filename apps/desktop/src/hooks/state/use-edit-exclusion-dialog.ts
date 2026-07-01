import { Store, useStore } from "@tanstack/react-store";

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

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openEditExclusionDialog(options: EditExclusionDialogOptions) {
  store.setState(() => ({
    isOpen: true,
    options,
  }));
}

export function useEditExclusionDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openEditExclusionDialog,
    options,
  };
}
