import { fromBytes, toBytes } from "@desktop/lib/filesize";
import { ZPolicyLevelType, ZPolicyType } from "@schemas/policy";
import { diff } from "deep-object-diff";
import merge from "deepmerge";

export type CorePolicy = {
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
  splitter: {};
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

export function convertPolicyFromCore(
  policy: CorePolicy,
  level: ZPolicyLevelType,
): ZPolicyType | null {
  if (!policy) return null;

  return {
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
      denylist: policy.files.ignore?.map((expression) => ({
        expression,
        level,
      })),
      ignoreParentDenylist: policy.files.noParentIgnore,
      denyfiles: policy.files.ignoreDotFiles?.map((filename) => ({
        filename,
        level,
      })),
      ignoreParentDenyfiles: policy.files.noParentDotFiles,
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
          : level === "VAULT"
            ? "SCHEDULE"
            : policy.scheduling.cron?.length ||
                policy.scheduling.intervalSeconds ||
                policy.scheduling.timeOfDay?.length
              ? "SCHEDULE"
              : undefined,
      interval: policy.scheduling.intervalSeconds
        ? policy.scheduling.intervalSeconds.toString()
        : level === "VAULT"
          ? "NONE"
          : undefined,
      times: policy.scheduling.timeOfDay
        ?.map(({ hour, min }) =>
          hour && min
            ? {
                hour,
                minute: min,
                level,
              }
            : null,
        )
        .filter(Boolean) as {
        hour: number;
        minute: number;
        level: ZPolicyLevelType;
      }[],
      cron: policy.scheduling.cron?.map((expression, index) => ({
        id: `${level}-${index}-${expression}`,
        expression,
        level,
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
      minFileSize: policy.compression.minSize,
      maxFileSize: policy.compression.maxSize,
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

export function convertPolicyToCore(
  policy: ZPolicyType,
  level: ZPolicyLevelType,
) {
  const policyCore: CorePolicy = {
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
      ignore: policy.files?.denylist?.map(({ expression }) => expression),
      noParentIgnore: policy.files?.ignoreParentDenylist,
      ignoreDotFiles: policy.files?.denyfiles?.map(({ filename }) => filename),
      noParentDotFiles: policy.files?.ignoreParentDenyfiles,
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
      manual: policy.schedule?.trigger === "MANUAL" ? true : undefined,
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
      onlyCompress: policy.compression?.extensionAllowlist,
      neverCompress: policy.compression?.extensionDenylist,
      minSize: policy.compression?.minFileSize,
      maxSize: policy.compression?.maxFileSize,
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

  if (level === "FOLDER") return JSON.parse(JSON.stringify(policyCore));
  return policyCore;
}

export function mergeFolderPolicy(
  folderPolicy: ZPolicyType,
  vaultPolicy: ZPolicyType,
) {
  // Delete all undefined properties
  folderPolicy = JSON.parse(JSON.stringify(folderPolicy));

  return merge(vaultPolicy, folderPolicy, {});
}

export function getFolderPolicyChanges(
  vaultPolicy: ZPolicyType,
  folderPolicy: ZPolicyType,
) {
  const changes = diff(vaultPolicy, folderPolicy) as ZPolicyType;

  if (changes.schedule?.times)
    changes.schedule.times = Object.values(changes.schedule.times);
  if (changes.schedule?.cron)
    changes.schedule.cron = Object.values(changes.schedule.cron);
  if (changes.files?.denylist)
    changes.files.denylist = Object.values(changes.files?.denylist || {});
  if (changes.files?.denyfiles)
    changes.files.denyfiles = Object.values(changes.files?.denyfiles || {});
  if (changes.files?.maxFileSize !== undefined)
    changes.files.maxFileSize = folderPolicy.files.maxFileSize;

  return changes;
}

export function getFolderPolicyUpdates(
  vaultPolicy: ZPolicyType,
  folderPolicy: ZPolicyType,
) {
  return convertPolicyToCore(
    getFolderPolicyChanges(vaultPolicy, folderPolicy),
    "FOLDER",
  );
}

export const defaultPolicy: ZPolicyType = {
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
    denyfiles: [
      {
        filename: ".blinkdiskignore",
        level: "VAULT",
      },
    ],
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
