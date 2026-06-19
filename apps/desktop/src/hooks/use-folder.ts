import { useFolderList } from "@desktop/hooks/queries/core/use-folder-list";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import type { ProfileFilter } from "@desktop/hooks/use-profile";
import { useMemo } from "react";

export function useFolder(
  folderId?: string,
  options: { profileFilter?: ProfileFilter } = {},
) {
  const { data: folders } = useFolderList(
    options.profileFilter === undefined
      ? undefined
      : { profileFilter: options.profileFilter },
  );
  const { folderId: defaultFolderId } = useFolderId();

  const folder = useMemo(() => {
    return folders?.find(
      (folder) => folder.id === (folderId || defaultFolderId),
    );
  }, [folders, folderId, defaultFolderId]);

  return { data: folder };
}
