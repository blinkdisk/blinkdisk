export function getMissingRcloneRemote(error: string, remotePath: string) {
  if (!/didn.t find section in config file/i.test(error)) return;

  return remotePath.split(":", 1)[0]?.trim() || undefined;
}
