export type SourceIdParts = {
  device: string;
  user: string;
  path: string;
};

export function buildSourceId({ device, user, path }: SourceIdParts) {
  return `${user}@${device}:${path}`;
}

export function parseSourceId(sourceId: string): SourceIdParts | null {
  const userSeparator = sourceId.indexOf("@");
  const pathSeparator = sourceId.indexOf(":");

  if (
    userSeparator <= 0 ||
    pathSeparator <= 0 ||
    userSeparator >= pathSeparator ||
    pathSeparator >= sourceId.length - 1
  ) {
    return null;
  }

  return {
    user: sourceId.slice(0, userSeparator),
    device: sourceId.slice(userSeparator + 1, pathSeparator),
    path: sourceId.slice(pathSeparator + 1),
  };
}
