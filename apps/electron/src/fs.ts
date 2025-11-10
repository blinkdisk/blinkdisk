import { access, constants, stat } from "fs/promises";
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

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
