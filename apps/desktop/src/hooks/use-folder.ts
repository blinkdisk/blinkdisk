import { useFolderList } from "@desktop/hooks/queries/core/use-folder-list";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useMemo } from "react";

export function useFolder(folderId?: string) {
  const { data: folders } = useFolderList();
  const { folderId: defaultFolderId } = useFolderId();

  const folder = useMemo(() => {
    return folders?.find(
      (folder) => folder.id === (folderId || defaultFolderId),
    );
  }, [folders, folderId, defaultFolderId]);

  return { data: folder };
}
