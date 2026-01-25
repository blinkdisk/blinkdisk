import { existsSync, readFileSync } from "node:fs";
import { hostname, userInfo } from "node:os";
import { resolve } from "node:path";
import { globalConfigDirectory } from "./path";

export function getUserName(vaultId: string) {
  try {
    const config = parseConfig(vaultId);
    if (config?.username) return config.username;

    return getCurrentUserName();
  } catch {
    return getCurrentUserName();
  }
}

export function getHostName(vaultId: string) {
  try {
    const config = parseConfig(vaultId);
    if (config?.hostname) return config.hostname;

    return getCurrentHostName();
  } catch {
    return getCurrentHostName();
  }
}

function parseConfig(vaultId: string) {
  const path = resolve(globalConfigDirectory(), `${vaultId}.config`);
  if (existsSync(path)) {
    const raw = readFileSync(path, "utf8");
    const config = JSON.parse(raw);

    return config;
  }

  return null;
}

const fallbackUserName = "nobody";
const fallbackHostName = "nohost";

// This behaviour should match the one from the core
// https://github.com/blinkdisk/core/blob/main/repo/userhost.go
function getCurrentUserName() {
  try {
    let username = userInfo().username;

    if (process.platform === "win32") {
      const backslashIndex = username.indexOf("\\");
      if (backslashIndex >= 0) {
        username = username.substring(backslashIndex + 1);
      }
    }

    return username || fallbackUserName;
  } catch (err) {
    console.error(`Cannot determine current user: ${err}`);
    return fallbackUserName;
  }
}

// This behaviour should match the one from the core
// https://github.com/blinkdisk/core/blob/main/repo/userhost.go
function getCurrentHostName() {
  try {
    const host = hostname();

    if (!host) throw new Error("Hostname is empty");

    return host.split(".")[0] || fallbackHostName;
  } catch (err) {
    console.error(`Unable to determine hostname: ${err}`);
    return fallbackHostName;
  }
}
