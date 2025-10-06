import { fromBits, toBits } from "@desktop/lib/bandwith";
import { ZVaultThrottleType } from "@schemas/vault";

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
  policy: CoreThrottle,
): ZVaultThrottleType | null {
  if (!policy) return null;

  return {
    upload: {
      enabled: !!policy.maxUploadSpeedBytesPerSecond,
      limit: policy.maxUploadSpeedBytesPerSecond
        ? fromBits(policy.maxUploadSpeedBytesPerSecond)
        : {
            value: 0,
            unit: "Mbps",
          },
    },
    download: {
      enabled: !!policy.maxDownloadSpeedBytesPerSecond,
      limit: policy.maxDownloadSpeedBytesPerSecond
        ? fromBits(policy.maxDownloadSpeedBytesPerSecond)
        : {
            value: 0,
            unit: "Mbps",
          },
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
