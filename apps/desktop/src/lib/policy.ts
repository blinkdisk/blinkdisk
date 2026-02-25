import { fromBytes, toBytes } from "@desktop/lib/filesize";
import { ZPolicyType } from "@schemas/policy";

export type CorePolicy = {
  name?: string;
  emoji?: string;
  retention: {
    keepLatest?: number;
    keepHourly?: number;
    keepDaily?: number;
    keepWeekly?: number;
    keepMonthly?: number;
    keepAnnual?: number;
    ignoreIdenticalSnapshots?: boolean;
  };
  files: {
    ignore?: string[];
    noParentIgnore?: boolean;
    ignoreDotFiles?: string[];
    noParentDotFiles?: boolean;
    ignoreCacheDirs?: boolean;
    maxFileSize?: number;
    oneFileSystem?: boolean;
  };
  errorHandling: {
    ignoreFileErrors?: boolean;
    ignoreDirectoryErrors?: boolean;
    ignoreUnknownTypes?: boolean;
  };
  scheduling: {
    manual?: boolean;
    intervalSeconds?: number;
    timeOfDay?: {
      hour: number;
      min: number;
    }[];
    cron?: string[];
    runMissed?: boolean;
  };
  compression: {
    compressorName?:
      | ""
      | "none"
      | "deflate-best-compression"
      | "deflate-best-speed"
      | "deflate-default"
      | "gzip"
      | "gzip-best-compression"
      | "gzip-best-speed"
      | "pgzip"
      | "pgzip-best-compression"
      | "pgzip-best-speed"
      | "s2-better"
      | "s2-default"
      | "s2-parallel-4"
      | "s2-parallel-8"
      | "zstd"
      | "zstd-better-compression"
      | "zstd-fastest"
      | "lz4"
      | "zstd-best-compression";
    onlyCompress?: string[];
    neverCompress?: string[];
    minSize?: number;
    maxSize?: number;
  };
  metadataCompression: {
    compressorName?: "zstd-fastest";
  };
  // Seems to be always empty?
  splitter: object;
  actions: {
    beforeFolder?: {
      script?: string;
      timeout?: number;
      mode?: "essential" | "optional" | "async";
    };
    afterFolder?: {
      script?: string;
      timeout?: number;
      mode?: "essential" | "optional" | "async";
    };
    beforeSnapshotRoot?: {
      script?: string;
      timeout?: number;
      mode?: "essential" | "optional" | "async";
    };
    afterSnapshotRoot?: {
      script?: string;
      timeout?: number;
      mode?: "essential" | "optional" | "async";
    };
  };
  osSnapshots: {
    volumeShadowCopy?: {
      enable?: number;
    };
  };
  logging: {
    directories?: {
      snapshotted?: number;
      ignored?: number;
    };
    entries?: {
      snapshotted?: number;
      ignored?: number;
      cacheHit?: number;
      cacheMiss?: number;
    };
  };
  upload: {
    maxParallelSnapshots?: number;
    maxParallelFileReads?: number;
    parallelUploadAboveSize?: number;
  };
  noParent?: boolean;
};

export function convertPolicyFromCore(policy: CorePolicy): ZPolicyType | null {
  if (!policy) return null;

  return {
    name: policy.name,
    emoji: policy.emoji,
    retention: {
      latest: policy.retention?.keepLatest,
      hourly: policy.retention?.keepHourly,
      daily: policy.retention?.keepDaily,
      weekly: policy.retention?.keepWeekly,
      monthly: policy.retention?.keepMonthly,
      annual: policy.retention?.keepAnnual,
      ignoreIdentical: policy.retention?.ignoreIdenticalSnapshots,
    },
    files: {
      exclusions: policy.files.ignore?.map((rule) => ({
        rule,
      })),
      ignoreParentExclusions: policy.files.noParentIgnore,
      exclusionRuleFiles: policy.files.ignoreDotFiles?.map((filename) => ({
        filename,
      })),
      ignoreParentExclusionRuleFiles: policy.files.noParentDotFiles,
      excludeCacheDirs: policy.files.ignoreCacheDirs,
      maxFileSize:
        policy.files.maxFileSize !== undefined
          ? fromBytes(policy.files.maxFileSize)
          : undefined,
      singleFileSystem: policy.files.oneFileSystem,
    },
    errors: {
      ignoreFile: policy.errorHandling.ignoreFileErrors,
      ignoreDirectory: policy.errorHandling.ignoreDirectoryErrors,
      ignoreUnknown: policy.errorHandling.ignoreUnknownTypes,
    },
    schedule: {
      trigger:
        policy.scheduling.manual !== undefined
          ? policy.scheduling.manual
            ? "MANUAL"
            : "SCHEDULE"
          : undefined,
      interval: policy.scheduling.intervalSeconds
        ? policy.scheduling.intervalSeconds.toString()
        : undefined,
      times: policy.scheduling.timeOfDay
        ?.map(({ hour, min }) =>
          hour && min
            ? {
                hour,
                minute: min,
              }
            : null,
        )
        .filter(Boolean) as {
        hour: number;
        minute: number;
      }[],
      cron: policy.scheduling.cron?.map((expression, index) => ({
        id: `${index}-${expression}`,
        expression,
      })),
      catchup: policy.scheduling.runMissed,
    },
    compression: {
      algorithm:
        policy.compression.compressorName !== ""
          ? policy.compression.compressorName
          : undefined,
      extensionAllowlist: policy.compression.onlyCompress,
      extensionDenylist: policy.compression.neverCompress,
      minFileSize:
        policy.compression.minSize !== undefined
          ? fromBytes(policy.compression.minSize)
          : undefined,
      maxFileSize:
        policy.compression.maxSize !== undefined
          ? fromBytes(policy.compression.maxSize)
          : undefined,
    },
    metadata: {
      algorithm: policy.metadataCompression.compressorName,
    },
    splitter: policy.splitter,
    scripts: {
      beforeFolder: policy.actions.beforeFolder,
      afterFolder: policy.actions.afterFolder,
      beforeSnapshot: policy.actions.beforeSnapshotRoot,
      afterSnapshot: policy.actions.afterSnapshotRoot,
    },
    osSnapshots: {
      volumeShadowCopy: {
        enable: policy.osSnapshots?.volumeShadowCopy?.enable,
      },
    },
    logging: {
      directories: {
        snapshotted: policy.logging?.directories?.snapshotted,
        ignored: policy.logging?.directories?.ignored,
      },
      files: {
        snapshotted: policy.logging.entries?.snapshotted,
        ignored: policy.logging.entries?.ignored,
        cache: {
          hit: policy.logging.entries?.cacheHit,
          miss: policy.logging.entries?.cacheMiss,
        },
      },
    },
    upload: {
      parallelBackups: policy.upload.maxParallelSnapshots,
      parallelFileReads: policy.upload.maxParallelFileReads,
      parallelUploadMinSize: policy.upload.parallelUploadAboveSize,
    },
    ignoreParentPolicy: policy.noParent,
  } satisfies ZPolicyType;
}

export function convertPolicyToCore(policy: ZPolicyType) {
  const policyCore: CorePolicy = {
    name: policy.name,
    emoji: policy.emoji,
    retention: {
      keepLatest: policy.retention?.latest,
      keepHourly: policy.retention?.hourly,
      keepDaily: policy.retention?.daily,
      keepWeekly: policy.retention?.weekly,
      keepMonthly: policy.retention?.monthly,
      keepAnnual: policy.retention?.annual,
      ignoreIdenticalSnapshots: policy.retention?.ignoreIdentical,
    },
    files: {
      ignore: policy.files?.exclusions
        ?.filter(Boolean)
        ?.map(({ rule }) => rule),
      noParentIgnore: policy.files?.ignoreParentExclusions,
      ignoreDotFiles: policy.files?.exclusionRuleFiles
        ?.filter(Boolean)
        ?.map(({ filename }) => filename),
      noParentDotFiles: policy.files?.ignoreParentExclusionRuleFiles,
      ignoreCacheDirs: policy.files?.excludeCacheDirs,
      maxFileSize:
        policy.files?.maxFileSize !== undefined
          ? toBytes(policy.files?.maxFileSize)
          : undefined,
      oneFileSystem: policy.files?.singleFileSystem,
    },
    errorHandling: {
      ignoreFileErrors: policy.errors?.ignoreFile,
      ignoreDirectoryErrors: policy.errors?.ignoreDirectory,
      ignoreUnknownTypes: policy.errors?.ignoreUnknown,
    },
    scheduling: {
      manual:
        policy.schedule?.trigger === "MANUAL"
          ? true
          : policy.schedule?.trigger === "SCHEDULE"
            ? false
            : undefined,
      ...(policy.schedule?.trigger !== "MANUAL" && {
        ...(policy.schedule?.interval !== "NONE" &&
          policy.schedule?.interval && {
            intervalSeconds: Number(policy.schedule?.interval),
          }),
        ...((policy.schedule?.times?.length || 0) > 0 && {
          timeOfDay: policy.schedule?.times?.map(({ hour, minute }) =>
            hour && minute
              ? {
                  hour,
                  min: minute,
                }
              : null,
          ) as
            | {
                hour: number;
                min: number;
              }[]
            | undefined,
        }),
        cron: policy.schedule?.cron?.map(({ expression }) => expression),
        runMissed: policy.schedule?.catchup,
      }),
    },
    compression: {
      compressorName: policy.compression?.algorithm,
      onlyCompress: policy.compression?.extensionAllowlist?.map((ext) =>
        ext.startsWith(".") ? ext : `.${ext}`,
      ),
      neverCompress: policy.compression?.extensionDenylist?.map((ext) =>
        ext.startsWith(".") ? ext : `.${ext}`,
      ),
      minSize:
        policy.compression?.minFileSize !== undefined
          ? toBytes(policy.compression.minFileSize)
          : undefined,
      maxSize:
        policy.compression?.maxFileSize !== undefined
          ? toBytes(policy.compression.maxFileSize)
          : undefined,
    },
    metadataCompression: {
      compressorName: policy.metadata?.algorithm,
    },
    splitter: policy.splitter || {},
    actions: {
      beforeFolder: policy.scripts?.beforeFolder,
      afterFolder: policy.scripts?.afterFolder,
      beforeSnapshotRoot: policy.scripts?.beforeSnapshot,
      afterSnapshotRoot: policy.scripts?.afterSnapshot,
    },
    osSnapshots: {
      volumeShadowCopy: {
        enable: policy.osSnapshots?.volumeShadowCopy?.enable,
      },
    },
    logging: {
      directories: {
        snapshotted: policy.logging?.directories?.snapshotted,
        ignored: policy.logging?.directories?.ignored,
      },
      entries: {
        snapshotted: policy.logging?.files?.snapshotted,
        ignored: policy.logging?.files?.ignored,
        cacheHit: policy.logging?.files?.cache.hit,
        cacheMiss: policy.logging?.files?.cache.miss,
      },
    },
    upload: {
      maxParallelSnapshots: policy.upload?.parallelBackups,
      maxParallelFileReads: policy.upload?.parallelFileReads,
      parallelUploadAboveSize: policy.upload?.parallelUploadMinSize,
    },
    noParent: policy.ignoreParentPolicy,
  } satisfies CorePolicy;

  return policyCore;
}

export function pickDefinedFields<T extends object>(
  policy: T,
  definedFields: string[],
): Partial<T> {
  const ret = {} as Partial<T>;
  for (const key of definedFields) {
    ret[key as keyof T] = policy[key as keyof T];
  }
  return ret;
}

export function getDefinedFields(policy: ZPolicyType) {
  function definedFields(obj: Record<string, unknown>): string[] {
    return Object.keys(obj).filter((key) => obj[key] !== undefined);
  }

  return {
    schedule: definedFields(policy.schedule),
    retention: definedFields(policy.retention),
    files: definedFields(policy.files),
    compression: definedFields(policy.compression),
  };
}

export const defaultVaultPolicy: ZPolicyType = {
  retention: {
    latest: 10,
    hourly: 48,
    daily: 7,
    weekly: 4,
    monthly: 24,
    annual: 3,
    ignoreIdentical: false,
  },
  files: {
    exclusionRuleFiles: [
      {
        filename: ".blinkdiskignore",
      },
    ],
    excludeCacheDirs: false,
  },
  errors: {
    ignoreFile: false,
    ignoreDirectory: false,
    ignoreUnknown: true,
  },
  schedule: {
    trigger: "SCHEDULE",
    interval: String(60 * 60 * 24),
    catchup: true,
  },
  compression: {
    algorithm: "none",
  },
  metadata: {
    algorithm: "zstd-fastest",
  },
  splitter: {},
  scripts: {},
  osSnapshots: {
    volumeShadowCopy: {
      enable: 0,
    },
  },
  logging: {
    directories: {
      snapshotted: 5,
      ignored: 5,
    },
    files: {
      snapshotted: 0,
      ignored: 5,
      cache: {
        hit: 0,
        miss: 0,
      },
    },
  },
  upload: {
    parallelBackups: 1,
    parallelUploadMinSize: 2147483648,
  },
  ignoreParentPolicy: false,
};

export const emptyPolicy: ZPolicyType = {
  name: undefined,
  emoji: undefined,
  retention: {},
  files: {},
  errors: {},
  schedule: {},
  compression: {},
  metadata: {},
  scripts: {},
  upload: {},
  osSnapshots: { volumeShadowCopy: {} },
  logging: { files: { cache: {} }, directories: {} },
};
