import { access, constants, lstat, stat } from "node:fs/promises";
import type { SourceType } from "@blinkdisk/schemas/source";
import { app } from "electron";
import getFolderSize from "get-folder-size";

const SUGGESTED_FOLDER_KINDS = [
  "documents",
  "pictures",
  "desktop",
  "videos",
  "music",
  "downloads",
] as const;

export type SuggestedFolderKind = (typeof SUGGESTED_FOLDER_KINDS)[number];

export type SuggestedFolder = {
  kind: SuggestedFolderKind;
  path: string;
};

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

export async function suggestedFolders() {
  const home = app.getPath("home");
  const folders: SuggestedFolder[] = [];

  for (const kind of SUGGESTED_FOLDER_KINDS) {
    let path: string;

    try {
      path = app.getPath(kind);
    } catch {
      // Not every platform defines every user folder.
      continue;
    }

    // Unconfigured XDG user dirs fall back to the home directory.
    if (path === home || folders.some((folder) => folder.path === path))
      continue;

    if (await isDirectory(path)) folders.push({ kind, path });
  }

  return folders;
}
