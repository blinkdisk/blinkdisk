import { useFolderList } from "@desktop/hooks/queries/core/use-folder-list";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { useMemo } from "react";

export function useFolder(
  folderId?: string,
  options: { profile?: SelectedProfile } = {},
) {
  const { data: folders } = useFolderList(
    options.profile === undefined ? undefined : { profile: options.profile },
  );
  const { folderId: defaultFolderId } = useFolderId();

  const folder = useMemo(() => {
    return folders?.find(
      (folder) => folder.id === (folderId || defaultFolderId),
    );
  }, [folders, folderId, defaultFolderId]);

  return { data: folder };
}
