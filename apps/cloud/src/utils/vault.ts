import { Database } from "@blinkdisk/db/index";

export async function deleteVaults(
  db: Database,
  env: CloudflareBindings,
  vaults: { id: string }[],
) {
  await db
    .updateTable("Vault")
    .set({ status: "DELETED" })
    .where(
      "id",
      "in",
      vaults.map((v) => v.id),
    )
    .execute();

  for (const vault of vaults) {
    const stub = env.VAULT.getByName(vault.id);
    await stub.delete(vault.id);
  }
}
