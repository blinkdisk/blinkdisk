import { access, constants, lstat, stat } from "node:fs/promises";
import type { SourceType } from "@blinkdisk/schemas/source";
import getFolderSize from "get-folder-size";

export async function fileExists(path: string) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function folderSize(path: string) {
  return await getFolderSize.loose(path, {
    ignore: /\.asar$/,
  });
}

export async function sourceType(path: string): Promise<SourceType> {
  const stats = await lstat(path);
  if (stats.isSymbolicLink()) return "symlink";
  if (stats.isDirectory()) return "directory";
  return "file";
}

export async function sourceSize(path: string): Promise<number> {
  const type = await sourceType(path);
  if (type === "directory") return folderSize(path);
  return (await lstat(path)).size;
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
