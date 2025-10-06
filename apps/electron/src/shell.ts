import { shell } from "electron";

export function openBrowser(rawUrl: string) {
  const url = new URL(rawUrl);
  if (!["http:", "https:", "mailto:"].includes(url.protocol)) return;
  return shell.openExternal(url.toString());
}
