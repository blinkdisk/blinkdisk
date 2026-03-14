import { GlobalStorageType, store } from "@electron/store";
import { nativeTheme } from "electron/main";

export function getTheme() {
  const theme = store.get(
    "preferences.theme",
  ) as GlobalStorageType["preferences"]["theme"];

  if (theme && theme !== "system") return theme;

  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
}
