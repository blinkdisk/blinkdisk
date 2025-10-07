import { useFolderList } from "@desktop/hooks/queries/core/use-folder-list";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useMemo } from "react";

export function useFolder() {
  const { data: folders } = useFolderList();
  const { folderId } = useFolderId();

  const folder = useMemo(() => {
    return folders?.find((folder) => folder.id === folderId);
  }, [folders, folderId]);

  return { data: folder };
}
