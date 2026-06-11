import { getStorageProvider } from "@blinkdisk/constants/providers";
import { LATEST_VAULT_VERSION } from "@blinkdisk/constants/vault";

export function mapProviderType(providerType: string) {
  const provider = getStorageProvider(providerType);
  if (!provider) throw new Error(`Provider ${providerType} not found`);
  return provider.coreType;
}

export function mapConfigFields(
  providerType: string,
  config: Record<string, unknown>,
  version?: number,
  token?: string | null,
) {
  if (providerType === "CLOUDBLINK")
    return {
      url: process.env.CLOUD_URL,
      token,
      version: version || LATEST_VAULT_VERSION,
    };

  const provider = getStorageProvider(providerType);
  if (!provider) throw new Error(`Provider ${providerType} not found`);

  const mapped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (provider.coreMapping?.[key]) {
      mapped[provider.coreMapping[key]] = value;
    } else {
      mapped[key] = value;
    }
  }

  return mapped;
}
