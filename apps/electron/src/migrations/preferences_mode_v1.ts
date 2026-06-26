import { store } from "@electron/store";

export async function migratePreferencesModeV1() {
  const mode = store.get("preferences.mode");

  if (mode !== "basic" && mode !== "advanced") {
    store.set("preferences.mode", "basic");
  }
}
