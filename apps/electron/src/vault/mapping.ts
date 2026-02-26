import { providers, ProviderType } from "@config/providers";
import { ProviderConfig } from "@schemas/providers";

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
  version: number,
  token?: string | null,
) {
  if (providerType === "CLOUDBLINK")
    return {
      url: process.env.CLOUD_URL,
      token,
      version,
    };

  const provider = providers.find(
    (p) => p.type === providerType || p.alias?.includes(providerType),
  );
  if (!provider) throw new Error(`Provider ${providerType} not found`);

  const mapped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (provider.coreMapping && provider.coreMapping[key]) {
      mapped[provider.coreMapping[key]] = value;
    } else {
      mapped[key] = value;
    }
  }

  return mapped;
}
