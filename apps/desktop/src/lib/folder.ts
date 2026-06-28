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

export async function hashFolder({
  hostName,
  userName,
  path,
}: {
  hostName: string;
  userName: string;
  path: string;
}) {
  const payload = `${hostName}@${userName}:${path}`;

  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-1", enc.encode(payload));
  return Array.from(new Uint8Array(hash))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
