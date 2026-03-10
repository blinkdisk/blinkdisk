import { providers, ProviderType } from "@config/providers";
import { LATEST_VAULT_VERSION } from "@config/vault";
import { ProviderConfig } from "@schemas/providers";
import { existsSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";

export function mapProviderType(providerType: ProviderType) {
  const provider = providers.find(
    (p) => p.type === providerType || p.alias?.includes(providerType),
  );
  if (!provider) throw new Error(`Provider ${providerType} not found`);
  return provider.coreType;
}

export function mapConfigFields(
  providerType: ProviderType,
  config: ProviderConfig,
  version?: number,
  token?: string | null,
) {
  if (providerType === "CLOUDBLINK")
    return {
      url: process.env.CLOUD_URL,
      token,
      version: version || LATEST_VAULT_VERSION,
    };

  const provider = providers.find(
    (p) => p.type === providerType || p.alias?.includes(providerType),
  );
  if (!provider) throw new Error(`Provider ${providerType} not found`);

  const mapped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    const mappedKey =
      provider.coreMapping && provider.coreMapping[key]
        ? provider.coreMapping[key]
        : key;

    if (mappedKey === "rcloneExe" && typeof value === "string" && value) {
      const resolvedPath = resolve(value);
      const name = basename(resolvedPath).toLowerCase();

      if (!name.startsWith("rclone"))
        throw new Error(
          "rclone executable path must point to a binary named rclone",
        );

      if (!existsSync(resolvedPath))
        throw new Error("rclone executable path does not exist");

      try {
        const stats = statSync(resolvedPath);
        if (!stats.isFile())
          throw new Error("rclone executable path is not a file");
      } catch {
        throw new Error("Failed to validate rclone executable path");
      }

      mapped[mappedKey] = resolvedPath;
    } else {
      mapped[mappedKey] = value;
    }
  }

  return mapped;
}
