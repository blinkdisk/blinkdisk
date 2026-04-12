import { store } from "@electron/store";

export async function migrateStoreV1() {
  const passwords = store.get("passwords") || {};
  store.set("passwords", {});

  Object.entries(passwords).forEach(([id, password]) => {
    if (id.startsWith("strg_")) id = id.replace(/^strg_/, "vlt_");
    store.set(`passwords.${id}`, password);
  });

  store.delete("storages");
  store.delete("configs");
  store.delete("vaults");
  store.delete("__internal__");

  store.delete("migrations.auth_v1");
}
