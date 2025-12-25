import { providers, ProviderType } from "@config/providers";
import { LATEST_STORAGE_VERSION } from "@config/storage";
import {
  deleteVaultFromCache,
  getAccountCache,
  getConfigCache,
  getStorageCache,
  getVaultCache,
} from "@electron/cache";
import { generateCSRFToken } from "@electron/csrf";
import {
  decryptString,
  decryptVaultConfig,
  EncryptedConfig,
} from "@electron/encryption";
import { log } from "@electron/log";
import { getPasswordCache } from "@electron/password";
import { corePath, globalConfigDirectory } from "@electron/path";
import { sendWindow } from "@electron/window";
import { ProviderConfig } from "@schemas/providers";
import { ZStorageOptionsType } from "@schemas/shared/storage";
import { generateId } from "@utils/id";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { app } from "electron";
import { createWriteStream } from "fs";
import { rename } from "fs/promises";
import https from "https";
import { resolve } from "path";
import { Cookie, CookieJar } from "tough-cookie";

export type VaultStatus =
  | "PASSWORD_MISSING"
  | "CONFIG_MISSING"
  | "READY"
  | "STARTING"
  | "RUNNING";

export class Vault {
  id: string;
  name: string;
  version: number;

  readOnly: boolean;
  status: VaultStatus;
  active: boolean = false;

  provider?: ProviderType;
  token?: string;
  config?: EncryptedConfig | null;
  profileId?: string;
  deviceId?: string;
  storageId?: string;

  process?: ChildProcessWithoutNullStreams;
  serverPassword?: string;
  serverControlPassword?: string;
  serverCertificateHash?: string;
  serverCertificate?: string;
  serverAddress?: string;

  cookies?: CookieJar = new CookieJar();
  signingKey?: string;
  sessionCookie?: string;
  csrfToken?: string;

  static vaults: Vault[] = [];
  static validationVault?: Vault;

  constructor({
    id,
    name,
    version,
    status,
    readOnly,
    provider,
    token,
    config,
    profileId,
    deviceId,
    storageId,
  }: {
    id: string;
    name: string;
    version: number;
    status: VaultStatus;
    readOnly: boolean;
    provider?: ProviderType;
    token?: string | null;
    config?: EncryptedConfig | null;
    profileId?: string;
    deviceId?: string;
    storageId?: string;
  }) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.status = status;
    this.readOnly = readOnly;

    if (token) this.token = token;
    if (provider) this.provider = provider;
    if (config) this.config = config;
    if (profileId) this.profileId = profileId;
    if (deviceId) this.deviceId = deviceId;
    if (storageId) this.storageId = storageId;
  }

  static initAll() {
    Vault.onCacheChanged();
  }

  static async onCacheChanged() {
    const vaults = getVaultCache();
    const accounts = getAccountCache();
    const storages = getStorageCache();
    const configs = getConfigCache();

    const activeVaultIds: string[] = [];

    for (const vault of vaults) {
      const account = accounts.find(
        (account) => account.id === vault.accountId,
      );

      if (!account) {
        log.error(`Account ${vault.accountId} not found, skipping.`);
        continue;
      }

      if (!account.active) {
        log.info(`Account ${vault.accountId} is not active, skipping.`);
        continue;
      }

      const storage = storages.find(
        (storage) => storage.id === vault.storageId,
      );

      if (!storage) {
        log.info(`Storage ${vault.storageId} not found, skipping.`);
        continue;
      }

      const config = configs.find((config) =>
        storage.configLevel === "STORAGE"
          ? config.level === "STORAGE" && config.storageId === storage.id
          : config.level === "PROFILE" &&
            config.profileId === account.profileId &&
            config.storageId === storage.id,
      )?.data;

      const password = getPasswordCache({ storageId: vault.storageId });
      const existingVault = this.vaults.find((v) => vault.id === v.id);

      if (existingVault) {
        activeVaultIds.push(vault.id);

        existingVault.name = vault.name;

        if (existingVault.status === "PASSWORD_MISSING" && password)
          existingVault.status = "READY";
        else if (existingVault.status === "CONFIG_MISSING" && config)
          existingVault.status = "READY";

        if (!password) existingVault.status = "PASSWORD_MISSING";
        else if (!config) existingVault.status = "CONFIG_MISSING";

        if (
          existingVault.status === "READY" &&
          (!existingVault.readOnly || existingVault.active)
        )
          existingVault.start();
      } else {
        const readOnly =
          account.deviceId !== vault.deviceId ||
          account.profileId !== vault.profileId;

        const decryptedToken = storage.token
          ? decryptString(storage.token, null)
          : null;

        const vaultInstance = new Vault({
          id: vault.id,
          version: storage.version,
          name: vault.name,
          token: decryptedToken,
          profileId: vault.profileId,
          deviceId: vault.deviceId,
          storageId: vault.storageId,
          provider: storage.provider,
          readOnly,
          config,
          status: !password
            ? "PASSWORD_MISSING"
            : !config
              ? "CONFIG_MISSING"
              : "READY",
        });

        this.vaults.push(vaultInstance);
        activeVaultIds.push(vault.id);

        if (!readOnly) vaultInstance.start();
      }
    }

    this.vaults = this.vaults.filter((vault) =>
      activeVaultIds.includes(vault.id),
    );
  }

  static async validate(vault: { type: ProviderType; config: ProviderConfig }) {
    if (!Vault.validationVault) {
      this.validationVault = new Vault({
        id: "temporary",
        name: "Temporary Vault",
        version: LATEST_STORAGE_VERSION,
        status: "READY",
        readOnly: false,
      });

      await this.validationVault.boot();
    }

    return (await this.validationVault?.fetch({
      method: "POST",
      path: "/api/v1/repo/exists",
      data: {
        storage: {
          type: this.mapProviderType(vault.type),
          config: this.mapConfigFields(vault.type, vault.config),
        },
      },
    })) as { code?: string; error?: string; uniqueID?: string };
  }

  static async create(payload: {
    vault: {
      id: string;
      name: string;
      provider: ProviderType;
      config: ProviderConfig;
      options: ZStorageOptionsType;
      password: string;
      token?: string | null;
    };
    storageId: string;
    deviceId: string;
    profileId: string;
    userPolicy: object;
    globalPolicy: object;
  }) {
    const options = payload.vault.options;

    const vault = new Vault({
      id: payload.vault.id,
      name: payload.vault.name,
      token: payload.vault.token,
      status: "READY",
      readOnly: false,
      version: LATEST_STORAGE_VERSION,
    });

    await vault.boot();

    try {
      const response = await vault.fetch({
        method: "POST",
        path: "/api/v1/repo/create",
        data: {
          globalPolicy: payload.globalPolicy,
          userPolicy: payload.userPolicy,
          clientOptions: {
            description: payload.vault.name,
            username: payload.profileId,
            hostname: payload.deviceId,
          },
          options: {
            uniqueId: btoa(payload.storageId),
            blockFormat: {
              version: options.version,
              ecc: options.errorCorrectionAlgorithm,
              eccOverheadPercent: options.errorCorrectionOverhead,
              encryption: options.encryption,
              hash: options.hash,
            },
            objectFormat: {
              splitter: options.splitter,
            },
          },
          storage: {
            type: this.mapProviderType(payload.vault.provider),
            config:
              payload.vault.provider === "BLINKDISK_CLOUD"
                ? {
                    url: process.env.CLOUD_URL,
                    token: payload.vault.token,
                    version: vault.version,
                  }
                : this.mapConfigFields(
                    payload.vault.provider,
                    payload.vault.config,
                  ),
          },
          password: payload.vault.password,
        },
      });

      vault.stop();
      return response as { error?: string };
    } catch (e) {
      vault.stop();
      return e as { code?: string; error?: string };
    }
  }

  static mapProviderType(providerType: ProviderType) {
    const provider = providers.find((p) => p.type === providerType);
    if (!provider) throw new Error(`Provider ${providerType} not found`);
    return provider.coreType;
  }

  static mapConfigFields(providerType: ProviderType, config: any) {
    const provider = providers.find((p) => p.type === providerType);
    if (!provider) throw new Error(`Provider ${providerType} not found`);

    const mapped: any = {};

    for (const [key, value] of Object.entries(config)) {
      if (provider.coreMapping && provider.coreMapping[key]) {
        mapped[provider.coreMapping[key]] = value;
      } else {
        mapped[key] = value;
      }
    }

    return mapped as object;
  }

  static stopAll() {
    Vault.vaults.forEach((vault) => vault.stop());
    Vault.vaults = [];
  }

  async start() {
    if (this.status !== "READY") return;
    this.status = "STARTING";

    await this.boot();

    const status = (await this.fetch({
      method: "GET",
      path: "/api/v1/repo/status",
    })) as {
      connected?: boolean;
    };

    if (!status.connected) {
      const res = await this.connect();

      if (res.error) {
        this.status = "READY";
        return;
      }
    }

    this.status = "RUNNING";
  }

  boot() {
    return new Promise<void>((res) => {
      this.signingKey = generateId();
      this.sessionCookie = generateId();

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
        "--blinkdiskui-notifications",
        `--auth-cookie-signing-key=${this.signingKey}`,
        "--shutdown-on-stdin",
        "--address=127.0.0.1:0",
        "--config-file",
        resolve(globalConfigDirectory(), `${this.id}.config`),
      ];

      this.process = spawn(corePath(), args, {});

      this.process?.stdout.on("data", (data) => this.log(data));

      this.process?.stderr.on("data", (data) => {
        this.handleData(data);

        if (this.serverAddress) {
          this.cookies?.setCookieSync(
            `BlinkDisk-Session-Cookie=${this.sessionCookie}`,
            this.serverAddress!,
          );
        }

        if (
          this.serverAddress &&
          this.serverPassword &&
          this.serverControlPassword &&
          this.serverPassword
        ) {
          res();
        }
      });
    });
  }

  async connect() {
    const password = getPasswordCache({ storageId: this.storageId! });

    if (!password) {
      this.status = "PASSWORD_MISSING";
      throw new Error("PASSWORD_MISSING");
    }

    const decryptedConfig = this.config
      ? await decryptVaultConfig({
          password,
          encrypted: this.config,
        })
      : null;

    return (await this.fetch({
      method: "POST",
      path: "/api/v1/repo/connect",
      data: {
        clientOptions: {
          description: this.name,
          username: this.profileId,
          hostname: this.deviceId,
          readonly: this.readOnly,
        },
        storage: {
          type: Vault.mapProviderType(this.provider!),
          config:
            this.provider === "BLINKDISK_CLOUD"
              ? {
                  url: process.env.CLOUD_URL,
                  token: this.token,
                  version: this.version,
                }
              : decryptedConfig
                ? Vault.mapConfigFields(this.provider!, decryptedConfig)
                : {},
        },
        password,
      },
    })) as { error?: string };
  }

  async fetch({
    method,
    path,
    search,
    data,
    variant = "renderer",
    filePath,
    raw,
  }: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    search?: Record<string, string>;
    data?: object;
    variant?: "main" | "renderer";
    filePath?: string;
    raw?: boolean;
  }) {
    const searchString = search
      ? `?${new URLSearchParams(search).toString()}`
      : "";

    return await this.fetchRaw({
      path: `${path}${searchString}`,
      data: JSON.stringify(data),
      method,
      variant,
      filePath,
      raw,
    });
  }

  async fetchRaw({
    method,
    path,
    data,
    variant = "renderer",
    filePath,
    raw,
  }: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    data?: any;
    variant?: "main" | "renderer";
    filePath?: string;
    raw?: boolean;
  }) {
    return await new Promise((res, rej) => {
      if (!this.csrfToken)
        this.csrfToken = generateCSRFToken(
          this.sessionCookie!,
          this.signingKey!,
        );

      const req = https.request(
        {
          ca: [this.serverCertificate!],
          host: "127.0.0.1",
          port: parseInt(new URL(this.serverAddress!).port).toString(),
          method,
          path,
          headers: {
            ...(data && {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(data),
            }),
            Authorization: `Basic ${Buffer.from(
              variant === "renderer"
                ? `blinkdisk:${this.serverPassword}`
                : `server-control:${this.serverControlPassword}`,
            ).toString("base64")}`,
            ...(variant === "renderer"
              ? {
                  "X-BlinkDisk-Csrf-Token": this.csrfToken,
                  cookie:
                    this.cookies?.getCookieStringSync(this.serverAddress!) ||
                    "",
                }
              : {}),
          },
        },
        (result) => {
          const cookies = result.headers["set-cookie"];

          if (cookies && cookies.length) {
            const parsed = cookies.map((c) => c && Cookie.parse(c));

            if (parsed && parsed.length) {
              parsed.forEach((cookie) => {
                if (!cookie || !this.cookies) return;
                this.cookies.setCookieSync(cookie, this.serverAddress!);
              });
            }
          }

          if (filePath) {
            const isAsar = filePath.endsWith(".asar");
            // Electron overrides the node:fs package for .asar files,
            // so we need to use a temporary file path.
            let tmpFilePath = isAsar ? `${filePath}.tmp` : filePath;

            const stream = createWriteStream(tmpFilePath);
            result.pipe(stream);

            stream.on("finish", async () => {
              stream.close();

              if (isAsar) await rename(tmpFilePath, filePath);

              res(null);
            });
          } else {
            let data = Buffer.alloc(0);
            result.on("data", (newData: Buffer) => {
              const newBuffer = Buffer.from(newData);
              data = Buffer.concat([data, newBuffer]);
            });

            result.on("end", () => {
              if (raw) return res(data.toString("utf8"));

              try {
                const parsed = JSON.parse(data.toString("utf8"));
                res(parsed);
              } catch (e) {
                console.info(data.toString("utf8"));
                rej(e);
              }
            });
          }
        },
      );

      if (data) req.write(data);

      req.on("error", (e) => {
        rej(e);
      });

      req.end();
    });
  }

  log(data: string) {
    if (!app.isPackaged) return console.log(`[${this.id}] ${data}`);
    log.info(`[${this.id}] ${data}`);
  }

  handleData(data: string) {
    let lines = (data + "").split("\n");

    for (let i = 0; i < lines.length; i++) {
      const delimiter = lines[i]?.indexOf(": ") || 0;
      if (delimiter < 0) continue;

      const key = lines[i]?.substring(0, delimiter);
      const value = lines[i]?.substring(delimiter + 2) || "";

      switch (key) {
        case "SERVER PASSWORD":
          this.serverPassword = value;
          break;

        case "SERVER CONTROL PASSWORD":
          this.serverControlPassword = value;
          break;

        case "SERVER CERT SHA256":
          this.serverCertificateHash = value;
          break;

        case "SERVER CERTIFICATE":
          this.serverCertificate = Buffer.from(value, "base64").toString(
            "ascii",
          );
          break;

        case "SERVER ADDRESS":
          this.serverAddress = value;
          break;

        case "BDC SPACE UPDATE":
          sendWindow("space.update", {
            vaultId: this.id,
            space: JSON.parse(value),
          });
          break;

        case "BDC STORAGE DELETED":
          deleteVaultFromCache(this.id);
          this.stop();
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
          this.log(data);
      }
    }
  }

  activate() {
    this.active = true;
    this.start();
  }

  stop() {
    if (!this.process) return;

    this.process?.kill("SIGTERM");

    this.process = undefined;
    this.serverPassword = undefined;
    this.serverControlPassword = undefined;
    this.serverCertificateHash = undefined;
    this.serverCertificate = undefined;
    this.serverAddress = undefined;

    this.status = "READY";
  }
}

export function getVault({ vaultId }: { vaultId: string }) {
  const vault = Vault.vaults.find((vault) => vault.id === vaultId);
  if (!vault) return null;
  return vault;
}
