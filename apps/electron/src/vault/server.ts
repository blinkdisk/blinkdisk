import { deleteVaultFromCache } from "@electron/cache";
import { log } from "@electron/log";
import { corePath, globalConfigDirectory } from "@electron/path";
import { vaults } from "@electron/vault/manage";
import { VaultServer, VaultStatus } from "@electron/vault/types";
import { sendWindow } from "@electron/window";
import { generateId } from "@utils/id";
import { tryCatch } from "@utils/try-catch";
import { spawn } from "child_process";
import { app } from "electron";
import { existsSync, renameSync } from "fs";
import { resolve } from "path";
import { CookieJar } from "tough-cookie";
import { fetchVault } from "./fetch";

export function startVaultServer(id: string, pollStatus = true) {
  return new Promise<VaultServer>((res) => {
    const cookies = new CookieJar();

    const signingKey = generateId();
    const sessionCookie = generateId();

    let address: string;
    let password: string;
    let controlPassword: string;
    let certificateHash: string;
    let certificate: string;

    migratePasswordFile(id);

    const args = [
      "server",
      "start",
      "--ui",
      "--tls-print-server-cert",
      "--tls-generate-cert-name=127.0.0.1",
      "--random-password",
      "--random-server-control-password",
      "--tls-generate-cert",
      "--async-repo-connect",
      "--error-notifications=always",
      "--kopiaui-notifications",
      `--auth-cookie-signing-key=${signingKey}`,
      "--shutdown-on-stdin",
      "--address=127.0.0.1:0",
      // CSRF tokens should only be required if the server
      // is hosted publicly. Cookies are only stored in this
      // class, so no csrf should be possible.
      "--disable-csrf-token-checks",
      "--config-file",
      resolve(globalConfigDirectory(), `${id}.config`),
    ];

    const process = spawn(corePath(), args, {});

    process?.stdout.on("data", (data) => logFormatted(id, data));

    process?.stderr.on("data", (data) => {
      const lines = (data + "").split("\n");

      for (let i = 0; i < lines.length; i++) {
        const delimiter = lines[i]?.indexOf(": ") || 0;
        if (delimiter < 0) continue;

        const key = lines[i]?.substring(0, delimiter);
        const value = lines[i]?.substring(delimiter + 2) || "";

        switch (key) {
          case "SERVER ADDRESS":
            address = value;
            break;

          case "SERVER PASSWORD":
            password = value;
            break;

          case "SERVER CONTROL PASSWORD":
            controlPassword = value;
            break;

          case "SERVER CERT SHA256":
            certificateHash = value;
            break;

          case "SERVER CERTIFICATE":
            certificate = Buffer.from(value, "base64").toString("ascii");
            break;

          case "BDC SPACE UPDATE":
            sendWindow("space.update", {
              vaultId: id,
              space: JSON.parse(value),
            });
            break;

          case "BDC VAULT DELETED":
            deleteVaultFromCache(id);
            break;

          // TODO: Handle notification events
          case "NOTIFICATION":
            break;

          //   const [notification, parseError] = tryCatch(() => JSON.parse(value));
          //   if (parseError)
          //      return log.error(
          //        `Failed to parse notification for ${this.id}: ${parseError}`,
          //      );
          //   this.handleNotification(notification);
          //   break;

          default:
            logFormatted(id, data);
        }
      }

      if (address) {
        cookies?.setCookieSync(
          `Kopia-Session-Cookie=${sessionCookie}`,
          address,
        );
      }

      if (
        address &&
        password &&
        controlPassword &&
        password &&
        certificate &&
        certificateHash
      ) {
        res({
          process,
          cookies,
          signingKey,
          sessionCookie,
          password,
          controlPassword,
          certificateHash,
          certificate,
          address,
        });

        if (pollStatus) startStatusPool(id);
      }
    });
  });
}

function migratePasswordFile(id: string) {
  try {
    const oldPasswordFile = resolve(
      globalConfigDirectory(),
      `${id}.config.blinkdisk-password`,
    );

    const newPasswordFile = resolve(
      globalConfigDirectory(),
      `${id}.config.kopia-password`,
    );

    if (existsSync(oldPasswordFile) && !existsSync(newPasswordFile))
      renameSync(oldPasswordFile, newPasswordFile);
  } catch (e) {
    console.warn("Failed to migrate password file", e);
  }
}

function logFormatted(id: string, data: string) {
  if (!app.isPackaged) return console.log(`[${id}] ${data}`);
  log.info(`[${id}] ${data}`);
}

async function startStatusPool(id: string) {
  let i = 0;
  while (true) {
    const vault = vaults[id];
    if (!vault) {
      await new Promise((res) => setTimeout(res, 1000));
      continue;
    }

    const [status, error] = await tryCatch(
      fetchVault(vault, {
        method: "GET",
        path: "/api/v1/repo/status",
      }) as Promise<{
        connected?: boolean;
        initTaskID: string;
      }>,
    );

    if (error) continue;

    let vaultStatus: VaultStatus;
    if (status.connected) vaultStatus = "RUNNING";
    else if (status.initTaskID) vaultStatus = "STARTING";
    else vaultStatus = "SETUP";

    i = i + 1;
    const delay = i < 10 ? 100 * i : 1000;

    if (vaults[id]) {
      vaults[id].status = vaultStatus;
      vaults[id].initTask = status.initTaskID || undefined;
    }

    await new Promise((res) => setTimeout(res, delay));
  }
}
