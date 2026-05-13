import { ZRestoreDirectoryType } from "@blinkdisk/schemas/directory";
import { fileExists } from "@electron/fs";
import { fetchVault } from "@electron/vault/fetch";
import { getVault } from "@electron/vault/manage";
import { VaultInstance } from "@electron/vault/types";
import { window } from "@electron/window";
import { app, dialog } from "electron";
import { chmod, readdir, symlink } from "fs/promises";
import pLimit from "p-limit";
import { dirname, join } from "path";

type Restore = {
  id: string;
  status: "RUNNING" | "COMPLETE";
  folderId: string;
  destination: string;
  progress: number;
  files?: number;
  directories?: number;
};

const restores: Restore[] = [];

const RESTORE_LOG_PREFIX = "[restore]";

function logRestore(message: string, data?: Record<string, unknown>) {
  console.info(`${RESTORE_LOG_PREFIX} ${message}`, data || "");
}

function warnRestore(message: string, data?: Record<string, unknown>) {
  console.warn(`${RESTORE_LOG_PREFIX} ${message}`, data || "");
}

function errorRestore(
  message: string,
  error: unknown,
  data?: Record<string, unknown>,
) {
  console.error(`${RESTORE_LOG_PREFIX} ${message}`, data || "", error);
}

export type RestoreItem = {
  objectId: string;
  name: string;
  type: "FILE" | "SYMLINK" | "DIRECTORY";
};

export function splitFileName(name: string): {
  baseName: string;
  extension: string;
} {
  const parts = name.split(".");
  if (parts.length > 1) {
    return {
      baseName: parts.slice(0, -1).join("."),
      extension: parts.at(-1) || "",
    };
  }
  return { baseName: name, extension: "" };
}

export function generateDuplicateName(
  baseName: string,
  extension: string,
  counter: number,
): string {
  return `${baseName} (${counter})${extension ? `.${extension}` : ""}`;
}

async function restore(
  item: RestoreItem,
  directory: string,
  vault: VaultInstance,
  onProgress?: (progress: number) => void,
) {
  logRestore("restore item started", {
    itemName: item.name,
    itemType: item.type,
    objectId: item.objectId,
    directory,
    hasProgressCallback: !!onProgress,
  });

  let path = join(directory, item.name);
  const pathExists = await fileExists(path);

  if (pathExists) {
    logRestore("restore target already exists, searching duplicate name", {
      originalPath: path,
      itemName: item.name,
    });

    const { baseName: fileBaseName, extension: fileExtension } = splitFileName(
      item.name,
    );

    let counter = 1;
    while (true) {
      const newPath = join(
        directory,
        generateDuplicateName(fileBaseName, fileExtension, counter++),
      );

      const exists = await fileExists(newPath);
      if (!exists) {
        path = newPath;
        logRestore("restore duplicate target selected", {
          path,
          counter: counter - 1,
        });
        break;
      }
    }
  }

  if (item.type === "DIRECTORY") {
    logRestore("directory restore task request", {
      itemName: item.name,
      objectId: item.objectId,
      targetPath: path,
    });

    const res = (await fetchVault(vault, {
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

    logRestore("directory restore task created", {
      itemName: item.name,
      taskId: res.id,
      targetPath: path,
    });

    let total = 0;
    if (onProgress) total = await getDirectoryItemCount(vault, item.objectId);
    if (onProgress) {
      logRestore("directory restore total item count loaded", {
        itemName: item.name,
        objectId: item.objectId,
        total,
      });
    }

    while (true) {
      const restore = await getRestoreStatus(vault, res.id);
      logRestore("directory restore task status", {
        itemName: item.name,
        taskId: res.id,
        status: restore.status,
        count: restore.count,
        total,
      });

      if (restore.status !== "RUNNING") {
        try {
          // Kopia doesn't set the correct permissions on
          // the parent folder, so we change it manually.
          // https://github.com/kopia/kopia/issues/4324
          await chmod(path, 0o755);
        } catch (e) {
          warnRestore("failed to change restored folder permissions", {
            path,
            error: e instanceof Error ? e.message : String(e),
          });
        }

        logRestore("directory restore item complete", {
          itemName: item.name,
          taskId: res.id,
          targetPath: path,
          status: restore.status,
        });
        break;
      }

      if (onProgress) onProgress(total > 0 ? restore.count / total : 0);

      await new Promise((res) => setTimeout(res, 1000));
    }
  } else if (item.type === "SYMLINK") {
    logRestore("symlink restore request", {
      itemName: item.name,
      objectId: item.objectId,
      targetPath: path,
    });

    const res = (await fetchVault(vault, {
      method: "GET",
      path: `/api/v1/objects/${item.objectId}`,
      search: {
        fname: item.name,
      },
      raw: true,
    })) as string;

    if (!res) {
      warnRestore("symlink restore returned empty target", {
        itemName: item.name,
        objectId: item.objectId,
      });
      return;
    }
    await symlink(res, path);
    logRestore("symlink restore complete", {
      itemName: item.name,
      targetPath: path,
      linkTarget: res,
    });
  } else {
    logRestore("file restore request", {
      itemName: item.name,
      itemType: item.type,
      objectId: item.objectId,
      targetPath: path,
    });

    await fetchVault(vault, {
      method: "GET",
      path: `/api/v1/objects/${item.objectId}`,
      search: {
        fname: item.name,
      },
      filePath: path,
    });

    logRestore("file restore complete", {
      itemName: item.name,
      objectId: item.objectId,
      targetPath: path,
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

  const vault = getVault(vaultId);
  if (!vault) throw new Error("VAULT_NOT_FOUND");

  logRestore("restoreSingle dialog opened", {
    vaultId,
    folderId,
    itemName: item.name,
    itemType: item.type,
    objectId: item.objectId,
  });

  const result = await dialog.showOpenDialog(window, {
    defaultPath: app.getPath("downloads"),
    properties: ["openDirectory"],
    title: dialogTitle,
  });

  logRestore("restoreSingle dialog result", {
    canceled: result.canceled,
    filePaths: result.filePaths,
    itemName: item.name,
    itemType: item.type,
  });

  if (result.canceled || !result.filePaths[0]) return false;
  const destination = result.filePaths[0];

  queueMicrotask(async () => {
    const restoreId = Math.random().toString(16);

    logRestore("restoreSingle queued", {
      restoreId,
      destination,
      itemName: item.name,
      itemType: item.type,
      objectId: item.objectId,
    });

    restores.push({
      id: restoreId,
      status: "RUNNING",
      destination,
      progress: 0,
      files: item.type !== "DIRECTORY" ? 1 : 0,
      directories: item.type === "DIRECTORY" ? 1 : 0,
      folderId,
    });

    try {
      await restore(item, destination, vault, (progress) =>
        updateRestore(restoreId, { progress: progress * 0.9 }),
      );

      completeRestore(restoreId);
      logRestore("restoreSingle complete", { restoreId, destination });
    } catch (e) {
      errorRestore("restoreSingle failed", e, { restoreId, destination });
      completeRestore(restoreId);
    }
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

  const vault = getVault(vaultId);
  if (!vault) throw new Error("VAULT_NOT_FOUND");

  logRestore("restoreMultiple dialog opened", {
    vaultId,
    folderId,
    itemCount: items.length,
    items: items.map((item) => ({
      name: item.name,
      type: item.type,
      objectId: item.objectId,
    })),
  });

  const result = await dialog.showOpenDialog(window, {
    title: dialogTitle,
    defaultPath: app.getPath("downloads"),
    properties: ["openDirectory"],
  });

  logRestore("restoreMultiple dialog result", {
    canceled: result.canceled,
    filePaths: result.filePaths,
    itemCount: items.length,
  });

  if (result.canceled || !result.filePaths.length) return false;
  const directory = result.filePaths[0] || app.getPath("downloads");

  queueMicrotask(async () => {
    const limit = pLimit(10);
    const restoreId = Math.random().toString(16);

    logRestore("restoreMultiple queued", {
      restoreId,
      directory,
      itemCount: items.length,
    });

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
        logRestore("restoreMultiple item started", {
          restoreId,
          itemName: item.name,
          itemType: item.type,
          objectId: item.objectId,
        });
        await restore(item, directory, vault);
        updateRestore(restoreId, {
          progress: ((items.length - limit.pendingCount) / items.length) * 0.9,
        });
        logRestore("restoreMultiple item complete", {
          restoreId,
          itemName: item.name,
          itemType: item.type,
          pendingCount: limit.pendingCount,
          activeCount: limit.activeCount,
        });
      }),
    );

    try {
      await Promise.all(tasks);

      completeRestore(restoreId);
      logRestore("restoreMultiple complete", { restoreId, directory });
    } catch (e) {
      errorRestore("restoreMultiple failed", e, { restoreId, directory });
      completeRestore(restoreId);
    }
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
  const vault = getVault(vaultId);
  if (!vault) throw new Error("VAULT_NOT_FOUND");

  logRestore("restoreDirectory requested", {
    vaultId,
    folderId,
    objectId,
    options,
  });

  queueMicrotask(async () => {
    const restoreId = Math.random().toString(16);
    const destination =
      options.type === "UNPACKED"
        ? options.directoryPath
        : dirname(options.filePath);

    logRestore("restoreDirectory queued", {
      restoreId,
      objectId,
      options,
      destination,
    });

    restores.push({
      id: restoreId,
      status: "RUNNING",
      destination,
      files: 0,
      directories: 1,
      progress: 0,
      folderId,
    });

    try {
      logRestore("restoreDirectory task request", {
        restoreId,
        objectId,
        mode: options.type,
        targetPath:
          options.type === "UNPACKED" ? options.directoryPath : undefined,
        zipFile: options.type === "ZIP" ? options.filePath : undefined,
        compress: options.type === "ZIP" ? options.compress : undefined,
      });

      const res = (await fetchVault(vault, {
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

      logRestore("restoreDirectory task created", {
        restoreId,
        taskId: res.id,
        objectId,
      });

      const total = await getDirectoryItemCount(vault, objectId);
      logRestore("restoreDirectory total item count loaded", {
        restoreId,
        taskId: res.id,
        objectId,
        total,
      });

      while (true) {
        const restore = await getRestoreStatus(vault, res.id);
        logRestore("restoreDirectory task status", {
          restoreId,
          taskId: res.id,
          status: restore.status,
          count: restore.count,
          total,
        });

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
            logRestore("restoreDirectory chmod child directories", {
              restoreId,
              directoryPath: options.directoryPath,
              directoryCount: directories.length,
            });

            for (const directory of directories) {
              // Kopia doesn't set the correct permissions on
              // the parent folder, so we change it manually.
              // https://github.com/kopia/kopia/issues/4324
              try {
                await chmod(join(options.directoryPath, directory.name), 0o755);
              } catch (e) {
                warnRestore(
                  "failed to change restored child folder permissions",
                  {
                    path: join(options.directoryPath, directory.name),
                    error: e instanceof Error ? e.message : String(e),
                  },
                );
              }
            }
          }

          completeRestore(restoreId);
          logRestore("restoreDirectory complete", {
            restoreId,
            taskId: res.id,
            status: restore.status,
            destination,
          });
          break;
        }

        updateRestore(restoreId, {
          progress: (total > 0 ? restore.count / total : 0) * 0.9,
        });
        await new Promise((res) => setTimeout(res, 1000));
      }
    } catch (e) {
      errorRestore("restoreDirectory failed", e, {
        restoreId,
        objectId,
        destination,
        options,
      });
      completeRestore(restoreId);
    }
  });

  return true;
}

async function getRestoreStatus(vault: VaultInstance, restoreId: string) {
  logRestore("getRestoreStatus request", { restoreId });

  const task = (await fetchVault(vault, {
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

async function getDirectoryItemCount(vault: VaultInstance, objectId: string) {
  logRestore("getDirectoryItemCount request", { objectId });

  const stats = (await fetchVault(vault, {
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
  logRestore("checkEmpty request", { directoryPath });
  const files = await readdir(directoryPath);
  logRestore("checkEmpty result", { directoryPath, count: files.length });
  return files.length === 0;
}

export async function listRestores({ folderId }: { folderId: string }) {
  logRestore("listRestores request", {
    folderId,
    restoreCount: restores.length,
  });
  return restores.filter((restore) => restore.folderId === folderId);
}

function updateRestore(id: string, update: Partial<Restore>) {
  const index = restores.findIndex((restore) => restore.id === id);
  if (index !== -1 && restores[index]) {
    restores[index] = { ...restores[index], ...update };
    logRestore("restore state updated", {
      id,
      update,
      restore: restores[index],
    });
  } else {
    warnRestore("restore state update skipped, restore not found", {
      id,
      update,
    });
  }
}

function completeRestore(id: string) {
  logRestore("restore state completing", { id });
  updateRestore(id, { status: "COMPLETE", progress: 1 });
  setTimeout(() => removeRestore(id), 5000);
}

function removeRestore(id: string) {
  const index = restores.findIndex((restore) => restore.id === id);
  if (index !== -1) {
    restores.splice(index, 1);
    logRestore("restore state removed", { id });
  } else {
    warnRestore("restore state remove skipped, restore not found", { id });
  }
}
