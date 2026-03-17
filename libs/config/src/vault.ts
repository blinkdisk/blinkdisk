export const DEFAULT_VAULT_OPTIONS = {
  version: 2,
  encryption: "AES256-GCM-HMAC-SHA256",
  hash: "BLAKE2B-256-128",
  splitter: "DYNAMIC-4M-BUZHASH",
  errorCorrectionAlgorithm: "REED-SOLOMON-CRC32",
  errorCorrectionOverhead: 0,
} as const;

export const LATEST_VAULT_VERSION = 2;
