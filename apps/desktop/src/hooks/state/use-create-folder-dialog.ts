import { ZCreateFolderFormType } from "@schemas/folder";
import { atom, useAtom } from "jotai";

const createFolderAtom = atom(false);
const defaultValuesAtom = atom<Partial<ZCreateFolderFormType> | null>(null);

export function useCreateFolderDialog() {
  const [isOpen, setIsOpen] = useAtom(createFolderAtom);
  const [defaultValues, setDefaultValues] = useAtom(defaultValuesAtom);

  function openCreateFolder(values?: Partial<ZCreateFolderFormType>) {
    if (values) {
      setDefaultValues(values);
    } else {
      setDefaultValues(null);
    }
    setIsOpen(true);
  }

  function clearDefaultValues() {
    setDefaultValues(null);
  }

  return {
    isOpen,
    setIsOpen,
    openCreateFolder,
    defaultValues,
    clearDefaultValues,
  };
}
