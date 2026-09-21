export const DEFAULT_VAULT_OPTIONS = {
  version: 2,
  encryption: "AES256-GCM-HMAC-SHA256",
  hash: "BLAKE2B-256-128",
  splitter: "DYNAMIC-4M-BUZHASH",
  errorCorrectionAlgorithm: "REED-SOLOMON-CRC32",
  errorCorrectionOverhead: 0,
} as const;

export const LATEST_VAULT_VERSION = 2;

// The core backup engine normally prints its startup details within a
// few seconds. This bounds the wait so a failed spawn or an engine that
// never becomes ready rejects instead of hanging forever.
export const VAULT_SERVER_START_TIMEOUT_MS = 30_000;

// Socket inactivity timeout for requests to the core backup engine.
// It measures idle time, so it does not interrupt an active transfer
// (like a large restore download), but it does catch a request that
// hangs with no response because the storage is unreachable.
export const VAULT_REQUEST_TIMEOUT_MS = 120_000;
