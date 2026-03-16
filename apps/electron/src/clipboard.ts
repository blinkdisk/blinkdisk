import { clipboard } from "electron";

export function readClipboard() {
  return clipboard.readText();
}
