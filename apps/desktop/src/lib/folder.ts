export type FolderIdParts = {
  device: string;
  user: string;
  path: string;
};

export function buildFolderId({ device, user, path }: FolderIdParts) {
  return `${user}@${device}:${path}`;
}

export function parseFolderId(folderId: string): FolderIdParts | null {
  const userSeparator = folderId.indexOf("@");
  const pathSeparator = folderId.indexOf(":");

  if (
    userSeparator <= 0 ||
    pathSeparator <= 0 ||
    userSeparator >= pathSeparator ||
    pathSeparator >= folderId.length - 1
  ) {
    return null;
  }

  return {
    user: folderId.slice(0, userSeparator),
    device: folderId.slice(userSeparator + 1, pathSeparator),
    path: folderId.slice(pathSeparator + 1),
  };
}
