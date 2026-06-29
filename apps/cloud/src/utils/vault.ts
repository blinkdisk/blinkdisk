import type { Database } from "@blinkdisk/db/index";
import { vault as vaultTable } from "@blinkdisk/db/schema";
import { eq } from "drizzle-orm";

export async function deleteVaults(
  db: Database,
  env: CloudflareBindings,
  vaults: { id: string }[],
) {
  for (const vault of vaults) {
    const stub = env.VAULT.getByName(vault.id);
    await stub.delete(vault.id);

    await db
      .update(vaultTable)
      .set({ status: "DELETED" })
      .where(eq(vaultTable.id, vault.id));
  }
}
