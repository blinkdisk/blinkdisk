import type { ZStorageOptionsType } from "@schemas/shared/storage";

export const defaultStorageOptions: ZStorageOptionsType = {
  version: 2,
  encryption: "AES256-GCM-HMAC-SHA256",
  hash: "BLAKE2B-256-128",
  splitter: "DYNAMIC-4M-BUZHASH",
  errorCorrectionAlgorithm: "REED-SOLOMON-CRC32",
  errorCorrectionOverhead: 0,
};

export const LATEST_STORAGE_VERSION = 1;
