import type { ZVaultThrottleType } from "@blinkdisk/schemas/vault";
import { fromBits, toBits } from "@desktop/lib/bandwith";

export const DEFAULT_THROTTLE_LIMIT = {
  value: 10,
  unit: "Mbps",
} as const;

export type CoreThrottle = {
  readsPerSecond?: number;
  writesPerSecond?: number;
  listsPerSecond?: number;
  maxUploadSpeedBytesPerSecond?: number;
  maxDownloadSpeedBytesPerSecond?: number;
  concurrentReads?: number;
  concurrentWrites?: number;
};

export function convertThrottleFromCore(
  policy: CoreThrottle | null | undefined,
): ZVaultThrottleType | null {
  if (!policy) return null;

  return {
    upload: {
      enabled: !!policy.maxUploadSpeedBytesPerSecond,
      limit: policy.maxUploadSpeedBytesPerSecond
        ? fromBits(policy.maxUploadSpeedBytesPerSecond)
        : DEFAULT_THROTTLE_LIMIT,
    },
    download: {
      enabled: !!policy.maxDownloadSpeedBytesPerSecond,
      limit: policy.maxDownloadSpeedBytesPerSecond
        ? fromBits(policy.maxDownloadSpeedBytesPerSecond)
        : DEFAULT_THROTTLE_LIMIT,
    },
  } satisfies ZVaultThrottleType;
}

export function convertThrottleToCore(policy: ZVaultThrottleType) {
  return {
    maxUploadSpeedBytesPerSecond: policy.upload?.enabled
      ? toBits(policy.upload.limit)
      : undefined,
    maxDownloadSpeedBytesPerSecond: policy.download?.enabled
      ? toBits(policy.download.limit)
      : undefined,
  } satisfies CoreThrottle;
}
