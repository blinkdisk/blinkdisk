import { compressionAlgorithms } from "@config/algorithms";
import { ZFolderEmoji, ZFolderName } from "@schemas/folder";
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
  value: z.number().min(0).optional(),
  unit: z.enum(["B", "KB", "MB", "GB", "TB"]),
});

export type ZFileSizeType = z.infer<typeof ZFileSize>;

export const ZFilesPolicy = z.object({
  exclusions: z.object({ rule: z.string() }).array().optional(),
  ignoreParentExclusions: z.boolean().optional(),
  exclusionRuleFiles: z.object({ filename: z.string() }).array().optional(),
  ignoreParentExclusionRuleFiles: z.boolean().optional(),
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
    })
    .array()
    .optional(),
  cron: z
    .object({
      id: z.string(),
      expression: z.string(),
    })
    .array()
    .optional(),
  catchup: z.boolean().optional(),
});

export type ZSchedulePolicyType = z.infer<typeof ZSchedulePolicy>;

export const ZCompressionPolicy = z.object({
  algorithm: z
    .enum([
      // Not sure why this is here, but it is.
      // I'm scared to touch it.
      "",
      ...compressionAlgorithms,
    ])
    .optional(),
  extensionAllowlist: z.string().array().optional(),
  extensionDenylist: z.string().array().optional(),
  minFileSize: ZFileSize.optional(),
  maxFileSize: ZFileSize.optional(),
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

export const ZGeneralPolicyForm = z.object({
  name: ZFolderName,
  emoji: ZFolderEmoji,
});

export type ZGeneralPolicyFormType = z.infer<typeof ZGeneralPolicyForm>;

export const ZPolicy = z.object({
  name: z.string().optional(),
  emoji: z.string().optional(),
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

export const ZExclusionForm = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("NAME"),
    matchType: z.enum(["EXACT", "STARTS_WITH", "ENDS_WITH", "CONTAINS"]),
    pattern: z.string().min(1),
    foldersOnly: z.boolean(),
  }),
  z.object({
    type: z.literal("EXTENSION"),
    extension: z.string().min(1),
  }),
]);

export type ZExclusionFormType = z.infer<typeof ZExclusionForm>;
