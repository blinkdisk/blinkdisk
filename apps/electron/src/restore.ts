import { fileExists } from "@electron/fs";
import { getVault, Vault } from "@electron/vault";
import { window } from "@electron/window";
import { ZRestoreDirectoryType } from "@schemas/directory";
import { app, dialog } from "electron";
import { chmod, readdir, symlink } from "fs/promises";
import pLimit from "p-limit";
import { dirname, join } from "path";

export type Restore = {
  id: string;
  status: "RUNNING" | "COMPLETE";
  folderId: string;
  destination: string;
  progress: number;
  files?: number;
  directories?: number;
};

const restores: Restore[] = [];

export type RestoreItem = {
  objectId: string;
  name: string;
  type: "FILE" | "SYMLINK" | "DIRECTORY";
};

async function restore(
  item: RestoreItem,
  directory: string,
  vault: Vault,
  onProgress?: (progress: number) => void,
) {
  let path = join(directory, item.name);
  const pathExists = await fileExists(path);

  if (pathExists) {
    const fileNameParts = item.name.split(".");
    const fileExtension = fileNameParts.length > 1 ? fileNameParts.at(-1) : "";
    const fileBaseName =
      fileNameParts.length > 1
        ? fileNameParts.slice(0, -1).join(".")
        : item.name;

    let counter = 1;
    while (true) {
      const newPath = join(
        directory,
        `${fileBaseName} (${counter++})${fileExtension ? `.${fileExtension}` : ""}`,
      );

      const exists = await fileExists(newPath);
      if (!exists) {
        path = newPath;
        break;
      }
    }
  }

  if (item.type === "DIRECTORY") {
    const res = (await vault.fetch({
      method: "POST",
      path: `/api/v1/restore`,
      data: {
        root: item.objectId,
        options: {
          incremental: false,
          ignoreErrors: true,
          restoreDirEntryAtDepth: 1000000,
          minSizeForPlaceholder: 1000000,
        },
        fsOutput: {
          targetPath: path,
          skipOwners: false,
          skipPermissions: false,
          skipTimes: false,
          ignorePermissionErrors: true,
          overwriteFiles: false,
          overwriteDirectories: false,
          overwriteSymlinks: false,
          writeFilesAtomically: false,
          writeSparseFiles: false,
        },
      },
    })) as { id: string };

    let total = 0;
    if (onProgress) total = await getDirectoryItemCount(vault, item.objectId);

    while (true) {
      const restore = await getRestoreStatus(vault, res.id);

      if (restore.status !== "RUNNING") {
        try {
          // Kopia doesn't set the correct permissions on
          // the parent folder, so we change it manually.
          // https://github.com/kopia/kopia/issues/4324
          await chmod(path, 0o755);
        } catch (e) {
          console.warn("Failed to change folder permissions:", e);
        }

        break;
      }

      if (onProgress) onProgress(restore.count / total);

      await new Promise((res) => setTimeout(res, 1000));
    }
  } else if (item.type === "SYMLINK") {
    const res = (await vault.fetch({
      method: "GET",
      path: `/api/v1/objects/${item.objectId}`,
      search: {
        fname: item.name,
      },
      raw: true,
    })) as string;

    if (!res) return;
    await symlink(res, path);
  } else {
    await vault.fetch({
      method: "GET",
      path: `/api/v1/objects/${item.objectId}`,
      search: {
        fname: item.name,
      },
      filePath: path,
    });
  }
}

export async function restoreSingle({
  item,
  vaultId,
  folderId,
  dialogTitle,
}: {
  item: RestoreItem;
  vaultId: string;
  folderId: string;
  dialogTitle: string;
}) {
  if (!window) throw new Error("WINDOW_NOT_INITIALIZED");

  const vault = getVault({ vaultId });
  if (!vault) throw new Error("VAULT_NOT_FOUND");

  const result = await dialog.showOpenDialog(window, {
    defaultPath: app.getPath("downloads"),
    properties: ["openDirectory"],
    title: dialogTitle,
  });

  if (result.canceled || !result.filePaths[0]) return false;
  const destination = result.filePaths[0];

  queueMicrotask(async () => {
    const restoreId = Math.random().toString(16);

    restores.push({
      id: restoreId,
      status: "RUNNING",
      destination,
      progress: 0,
      files: item.type !== "DIRECTORY" ? 1 : 0,
      directories: item.type === "DIRECTORY" ? 1 : 0,
      folderId,
    });

    await restore(item, destination, vault, (progress) =>
      updateRestore(restoreId, { progress: progress * 0.9 }),
    );

    completeRestore(restoreId);
  });

  return true;
}

export async function restoreMultiple({
  vaultId,
  folderId,
  items,
  dialogTitle,
}: {
  vaultId: string;
  folderId: string;
  items: RestoreItem[];
  dialogTitle: string;
}) {
  if (!window) throw new Error("WINDOW_NOT_INITIALIZED");

  const vault = getVault({ vaultId });
  if (!vault) throw new Error("VAULT_NOT_FOUND");

  const result = await dialog.showOpenDialog(window, {
    title: dialogTitle,
    defaultPath: app.getPath("downloads"),
    properties: ["openDirectory"],
  });

  if (result.canceled || !result.filePaths.length) return false;
  const directory = result.filePaths[0] || app.getPath("downloads");

  queueMicrotask(async () => {
    const limit = pLimit(10);
    const restoreId = Math.random().toString(16);

    restores.push({
      id: restoreId,
      status: "RUNNING",
      destination: directory,
      files: items.filter((item) => item.type !== "DIRECTORY").length,
      directories: items.filter((item) => item.type === "DIRECTORY").length,
      progress: 0,
      folderId,
    });

    const tasks = items.map((item) =>
      limit(async () => {
        await restore(item, directory, vault);
        updateRestore(restoreId, {
          progress: ((items.length - limit.pendingCount) / items.length) * 0.9,
        });
      }),
    );

    await Promise.all(tasks);

    completeRestore(restoreId);
  });

  return true;
}

export async function restoreDirectory({
  vaultId,
  folderId,
  objectId,
  options,
}: {
  vaultId: string;
  folderId: string;
  objectId: string;
  options: ZRestoreDirectoryType;
}) {
  const vault = getVault({ vaultId });
  if (!vault) throw new Error("VAULT_NOT_FOUND");

  queueMicrotask(async () => {
    const restoreId = Math.random().toString(16);

    restores.push({
      id: restoreId,
      status: "RUNNING",
      destination:
        options.type === "UNPACKED"
          ? options.directoryPath
          : dirname(options.filePath),
      files: 0,
      directories: 1,
      progress: 0,
      folderId,
    });

    const res = (await vault.fetch({
      method: "POST",
      path: `/api/v1/restore`,
      data: {
        root: objectId,
        options: {
          incremental: false,
          ignoreErrors: true,
          restoreDirEntryAtDepth: 1000000,
          minSizeForPlaceholder: 1000000,
        },
        ...(options.type === "ZIP"
          ? {
              zipFile: options.filePath,
              uncompressedZip: !options.compress,
            }
          : {
              fsOutput: {
                targetPath: options.directoryPath,
                skipOwners: false,
                skipPermissions: false,
                skipTimes: false,
                ignorePermissionErrors: true,
                overwriteFiles: true,
                overwriteDirectories: true,
                overwriteSymlinks: true,
                writeFilesAtomically: false,
                writeSparseFiles: false,
              },
            }),
      },
    })) as { id: string };

    const total = await getDirectoryItemCount(vault, objectId);

    while (true) {
      const restore = await getRestoreStatus(vault, res.id);

      if (restore.status !== "RUNNING") {
        if (options.type === "UNPACKED") {
          // Kopia doesn't set the correct permissions on
          // the parent folder, so we change it manually.
          // https://github.com/kopia/kopia/issues/4324
          await chmod(options.directoryPath, 0o755);

          const items = await readdir(options.directoryPath, {
            withFileTypes: true,
          });

          const directories = items.filter((item) => item.isDirectory());

          for (const directory of directories) {
            // Kopia doesn't set the correct permissions on
            // the parent folder, so we change it manually.
            // https://github.com/kopia/kopia/issues/4324
            try {
              await chmod(join(options.directoryPath, directory.name), 0o755);
            } catch (e) {
              console.warn("Failed to change folder permissions:", e);
            }
          }
        }

        completeRestore(restoreId);
        break;
      }

      updateRestore(restoreId, { progress: (restore.count / total) * 0.9 });
      await new Promise((res) => setTimeout(res, 1000));
    }
  });

  return true;
}

async function getRestoreStatus(vault: Vault, restoreId: string) {
  const task = (await vault.fetch({
    method: "GET",
    path: `/api/v1/tasks/${restoreId}`,
  })) as {
    status: string;
    counters: {
      "Ignored Errors": { value: 0 };
      "Restored Directories": { value: 2924 };
      "Restored Files": { value: 28481 };
      "Restored Symlinks": { value: 0 };
      "Skipped Files": { value: 0 };
    };
  };

  const count =
    (task?.counters?.["Restored Files"]?.value || 0) +
    (task?.counters?.["Restored Directories"]?.value || 0) +
    (task?.counters?.["Restored Symlinks"]?.value || 0) +
    (task?.counters?.["Skipped Files"]?.value || 0);

  return {
    status: task?.status,
    count,
  };
}

async function getDirectoryItemCount(vault: Vault, objectId: string) {
  const stats = (await vault.fetch({
    method: "GET",
    path: `/api/v1/objects/${objectId}`,
  })) as {
    summary: {
      files: number;
      symlinks: number;
      dirs: number;
    };
  };

  return (
    (stats?.summary?.files || 0) +
    (stats?.summary?.symlinks || 0) +
    (stats?.summary?.dirs || 0)
  );
}

export async function checkEmpty({ directoryPath }: { directoryPath: string }) {
  const files = await readdir(directoryPath);
  return files.length === 0;
}

export async function listRestores({ folderId }: { folderId: string }) {
  return restores.filter((restore) => restore.folderId === folderId);
}

function updateRestore(id: string, update: Partial<Restore>) {
  const index = restores.findIndex((restore) => restore.id === id);
  if (index !== -1 && restores[index])
    restores[index] = { ...restores[index], ...update };
}

function completeRestore(id: string) {
  updateRestore(id, { status: "COMPLETE", progress: 1 });
  setTimeout(() => removeRestore(id), 5000);
}

function removeRestore(id: string) {
  const index = restores.findIndex((restore) => restore.id === id);
  if (index !== -1) restores.splice(index, 1);
}
