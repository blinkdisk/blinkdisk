import { tryCatch } from "@blinkdisk/utils/try-catch";
import { log } from "@electron/log";
import { migrateAuthV1 } from "@electron/migrations/auth_v1";
import { migrateAuthV2 } from "@electron/migrations/auth_v2";
import { migrateStoreV1 } from "@electron/migrations/store_v1";
import { GlobalStorageType, store } from "@electron/store";
import { captureException } from "@sentry/electron/main";

const migrations = [
  { id: "store_v1", execute: migrateStoreV1 },
  {
    id: "auth_v1",
    execute: migrateAuthV1,
  },
  {
    id: "auth_v2",
    execute: migrateAuthV2,
  },
];

export async function runMigrations() {
  let completedMigrations =
    (store.get("migrations") as GlobalStorageType["migrations"]) || [];

  if (!completedMigrations || !Array.isArray(completedMigrations))
    completedMigrations = [];

  for (const migration of migrations) {
    const existing = completedMigrations.find((m) => m.id === migration.id);
    if (existing) continue;

    log.info(`Running migration ${migration.id}`);

    const [, error] = await tryCatch(migration.execute());

    if (error) {
      log.error(`Failed to execute migration ${migration.id}:`, error);
      captureException(error);
      continue;
    }

    log.info(`Migration ${migration.id} completed successfully`);

    completedMigrations.push({ id: migration.id, completedAt: new Date() });
  }

  store.set("migrations", completedMigrations);
}
