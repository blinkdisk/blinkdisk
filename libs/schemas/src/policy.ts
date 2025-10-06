import { z } from "zod";

export const ZPolicyLevel = z.enum(["VAULT", "FOLDER"]);

export type ZPolicyLevelType = z.infer<typeof ZPolicyLevel>;

export const ZRetentionPolicy = z.object({
  latest: z.number().int().min(0).optional(),
  hourly: z.number().int().min(0).optional(),
  daily: z.number().int().min(0).optional(),
  weekly: z.number().int().min(0).optional(),
  monthly: z.number().int().min(0).optional(),
  annual: z.number().int().min(0).optional(),
  ignoreIdentical: z.boolean().optional(),
});

export type ZRetentionPolicyType = z.infer<typeof ZRetentionPolicy>;

const ZFileSize = z.object({
  value: z.number().optional(),
  unit: z.enum(["B", "KB", "MB", "GB", "TB"]),
});

export type ZFileSizeType = z.infer<typeof ZFileSize>;

export const ZFilesPolicy = z.object({
  denylist: z
    .object({ expression: z.string(), level: ZPolicyLevel })
    .array()
    .optional(),
  ignoreParentDenylist: z.boolean().optional(),
  denyfiles: z
    .object({ filename: z.string(), level: ZPolicyLevel })
    .array()
    .optional(),
  ignoreParentDenyfiles: z.boolean().optional(),
  excludeCacheDirs: z.boolean().optional(),
  maxFileSize: ZFileSize.optional(),
  singleFileSystem: z.boolean().optional(),
});

export type ZFilesPolicyType = z.infer<typeof ZFilesPolicy>;

export const ZErrorsPolicy = z.object({
  ignoreFile: z.boolean().optional(),
  ignoreDirectory: z.boolean().optional(),
  ignoreUnknown: z.boolean().optional(),
});

export type ZErrorsPolicyType = z.infer<typeof ZErrorsPolicy>;

export const ZSchedulePolicy = z.object({
  trigger: z.enum(["SCHEDULE", "MANUAL"]).optional(),
  interval: z.union([z.string(), z.literal("NONE")]).optional(),
  times: z
    .object({
      hour: z.number().int().positive().optional(),
      minute: z.number().int().positive().optional(),
      level: ZPolicyLevel,
    })
    .array()
    .optional(),
  cron: z
    .object({
      id: z.string(),
      expression: z.string(),
      level: ZPolicyLevel,
    })
    .array()
    .optional(),
  catchup: z.boolean().optional(),
});

export type ZSchedulePolicyType = z.infer<typeof ZSchedulePolicy>;

export const ZCompressionPolicy = z.object({
  algorithm: z
    .enum([
      "",
      "none",
      "deflate-best-compression",
      "deflate-best-speed",
      "deflate-default",
      "gzip",
      "gzip-best-compression",
      "gzip-best-speed",
      "pgzip",
      "pgzip-best-compression",
      "pgzip-best-speed",
      "s2-better",
      "s2-default",
      "s2-parallel-4",
      "s2-parallel-8",
      "zstd",
      "zstd-better-compression",
      "zstd-fastest",
      "lz4",
      "zstd-best-compression",
    ])
    .optional(),
  extensionAllowlist: z.string().array().optional(),
  extensionDenylist: z.string().array().optional(),
  minFileSize: z.number().int().positive().optional(),
  maxFileSize: z.number().int().positive().optional(),
});

export type ZCompressionPolicyType = z.infer<typeof ZCompressionPolicy>;

export const ZMetadataPolicy = z.object({
  algorithm: z.enum(["zstd-fastest"]).optional(),
});

export type ZMetadataPolicyType = z.infer<typeof ZMetadataPolicy>;

export const ZSplitterPolicy = z.object({}).optional();

const ZScript = z.object({
  script: z.string().min(1).max(1024).optional(),
  timeout: z.number().int().positive().optional(),
  mode: z.enum(["essential", "optional", "async"]).optional(),
});

export type ZScriptType = z.infer<typeof ZScript>;

export const ZScriptsPolicy = z.object({
  beforeFolder: ZScript.optional(),
  afterFolder: ZScript.optional(),
  beforeSnapshot: ZScript.optional(),
  afterSnapshot: ZScript.optional(),
});

export type ZScriptsPolicyType = z.infer<typeof ZScriptsPolicy>;

export const ZOsSnapshotsPolicy = z.object({
  volumeShadowCopy: z.object({
    enable: z.number().int().min(0).optional(),
  }),
});

export type ZOsSnapshotsPolicyType = z.infer<typeof ZOsSnapshotsPolicy>;

export const ZLoggingPolicy = z.object({
  directories: z.object({
    snapshotted: z.number().int().min(0).optional(),
    ignored: z.number().int().min(0).optional(),
  }),
  files: z.object({
    snapshotted: z.number().int().min(0).optional(),
    ignored: z.number().int().min(0).optional(),
    cache: z.object({
      hit: z.number().int().min(0).optional(),
      miss: z.number().int().min(0).optional(),
    }),
  }),
});

export type ZLoggingPolicyType = z.infer<typeof ZLoggingPolicy>;

export const ZUploadPolicy = z.object({
  parallelBackups: z.number().int().positive().optional(),
  parallelFileReads: z.number().int().positive().optional(),
  parallelUploadMinSize: z.number().int().positive().optional(),
});

export type ZUploadPolicyType = z.infer<typeof ZUploadPolicy>;

export const ZIgnoreParentPolicy = z.boolean().optional();

export type ZIgnoreParentPolicyType = z.infer<typeof ZIgnoreParentPolicy>;

export const ZPolicy = z.object({
  retention: ZRetentionPolicy,
  files: ZFilesPolicy,
  errors: ZErrorsPolicy,
  schedule: ZSchedulePolicy,
  compression: ZCompressionPolicy,
  metadata: ZMetadataPolicy,
  splitter: ZSplitterPolicy,
  scripts: ZScriptsPolicy,
  osSnapshots: ZOsSnapshotsPolicy,
  logging: ZLoggingPolicy,
  upload: ZUploadPolicy,
  ignoreParentPolicy: ZIgnoreParentPolicy,
});

export type ZPolicyType = z.infer<typeof ZPolicy>;
