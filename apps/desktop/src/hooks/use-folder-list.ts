import {
  CoreFolderItem,
  useCoreFolderList,
} from "@desktop/hooks/queries/core/use-folder-list";
import { useAPIFolderList } from "@desktop/hooks/queries/use-folder-list";
import { useMemo } from "react";

export type FolderItem = CoreFolderItem & {
  id: string | null;
  name: string | null;
  emoji: string | null;
};

export function useFolderList() {
  const { data: apiFolders, isLoading: isApiLoading } = useAPIFolderList();
  const { data: coreFolders, isLoading: isCoreLoading } = useCoreFolderList();

  const isLoading = useMemo(
    () => isApiLoading || isCoreLoading,
    [isApiLoading, isCoreLoading],
  );

  const data = useMemo(() => {
    if (
      apiFolders === undefined ||
      apiFolders === null ||
      coreFolders === undefined ||
      coreFolders === null
    )
      return null;

    return coreFolders.map((coreFolder) => {
      const apiFolder = apiFolders.find(
        (apiFolder) => apiFolder.hash === coreFolder.hash,
      );

      return {
        ...coreFolder,
        ...(apiFolder
          ? {
              id: apiFolder.id,
              name: apiFolder.name,
              emoji: apiFolder.emoji,
            }
          : {
              id: coreFolder.hash,
              name: null,
              emoji: null,
            }),
      } satisfies FolderItem;
    });
  }, [apiFolders, coreFolders]);

  return { data, isLoading };
}
