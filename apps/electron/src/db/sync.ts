import { ZConfigType } from "@blinkdisk/schemas/config";
import { ZVaultType } from "@blinkdisk/schemas/vault";
import { tryCatch } from "@blinkdisk/utils/try-catch";
import { log } from "@electron/log";
import { globalAccountDirectory } from "@electron/path";
import { trpc } from "@electron/trpc";
import createFilesystemAdapter from "@signaldb/fs";
import { SyncManager } from "@signaldb/sync";
import { join } from "node:path";

export type SyncOptions = {
  name: string;
  accountId: string;
  type: "VAULT" | "CONFIG";
};

export const syncManager = new SyncManager({
  id: "sync-manager",
  persistenceAdapter: (name: string) =>
    createFilesystemAdapter(
      join(
        globalAccountDirectory(),
        `${name.replace("sync-manager-", "")}.sync.json`,
      ),
    ),
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
      async function pushConfigs() {
        return await trpc.config.push.mutate(
          {
            added: changes.added as unknown as ZConfigType[],
            modified: changes.modified as unknown as ZConfigType[],
          },
          {
            context: { accountId: options.accountId },
          },
        );
      }

      const [, error] = await tryCatch(pushConfigs);
      if (
        error &&
        (error as { data?: { code: string } }).data?.code === "VAULT_NOT_FOUND"
      ) {
        log.warn(
          "Config push failed due to missing vaults, retrying in 10 seconds...",
        );
        await new Promise((res) => setTimeout(res, 10000));
        await pushConfigs();
      }
    }
  },
});
