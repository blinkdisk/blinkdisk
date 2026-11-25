import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ZConfigType } from "@blinkdisk/schemas/config";
import type { ZVaultType } from "@blinkdisk/schemas/vault";
import {
  ACCOUNT_SYNC_FAILED_MARKER,
  getErrorCode,
} from "@blinkdisk/utils/error";
import { log } from "@electron/log";
import { globalAccountDirectory } from "@electron/path";
import { trpc } from "@electron/trpc";
import createFilesystemAdapter from "@signaldb/fs";
import { SyncManager } from "@signaldb/sync";

export type SyncOptions = {
  name: string;
  accountId: string;
  type: "VAULT" | "CONFIG";
};

export const syncManager = new SyncManager({
  id: "sync",
  persistenceAdapter: (name: string) => {
    const path = join(
      globalAccountDirectory(),
      `${name.replace("sync-sync-", "sync-")}.json`,
    );

    if (!existsSync(globalAccountDirectory()))
      mkdirSync(globalAccountDirectory(), { recursive: true });
    if (!existsSync(path)) writeFileSync(path, "[]");

    return createFilesystemAdapter(path);
  },
  pull: async (options: SyncOptions) => {
    let items: { id: string }[] = [];

    if (options.type === "VAULT") {
      const res = await trpc.vault.pull.query(undefined, {
        context: { accountId: options.accountId },
      });
      items = res.items;
    }

    if (options.type === "CONFIG") {
      const res = await trpc.config.pull.query(undefined, {
        context: { accountId: options.accountId },
      });
      items = res.items;
    }

    if (!Array.isArray(items)) throw new Error("Failed to pull items");

    return { items };
  },
  push: async (options: SyncOptions, { changes }) => {
    if (options.type === "VAULT") {
      await trpc.vault.push.mutate(
        {
          added: changes.added as unknown as ZVaultType[],
          modified: changes.modified as unknown as ZVaultType[],
        },
        {
          context: { accountId: options.accountId },
        },
      );
    }

    if (options.type === "CONFIG") {
      // The server rejects configs for vaults it doesn't know yet, so a new
      // vault has to be pushed before its config.
      await syncManager.pushChanges(`${options.accountId}/vault`);

      await trpc.config.push.mutate(
        {
          added: changes.added as unknown as ZConfigType[],
          modified: changes.modified as unknown as ZConfigType[],
        },
        {
          context: { accountId: options.accountId },
        },
      );
    }
  },
});

export async function syncAccount(accountId: string) {
  try {
    return await Promise.all([
      syncManager.sync(`${accountId}/vault`),
      syncManager.sync(`${accountId}/config`),
    ]);
  } catch (error) {
    log.error("Account sync failed", error, {
      code: getErrorCode(error),
      cause: error instanceof Error ? error.cause : undefined,
    });
    throw new Error(ACCOUNT_SYNC_FAILED_MARKER);
  }
}

export function getLastSync(collectionName: string) {
  const path = join(globalAccountDirectory(), "sync-operations.json");
  if (!existsSync(path)) return null;

  const raw = readFileSync(path, "utf8");
  if (!raw) return null;

  const operations = JSON.parse(raw) as {
    start: string;
    collectionName: string;
  }[];
  if (!operations.length) return null;

  const filtered = operations.filter(
    (op) => op.collectionName === collectionName,
  );
  if (!filtered.length) return null;

  const sorted = filtered.sort((a, b) => {
    return new Date(b.start).getTime() - new Date(a.start).getTime();
  });

  return sorted[0]?.start || null;
}
