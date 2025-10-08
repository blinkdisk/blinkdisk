import { z } from "zod";

const ZKey = z
  .string()
  .regex(/^(?!.*\.\.\/).+$/gm, 'Path must not include patterns like "../"');

export const ZCloudBase = z.object({
  requestId: z.string(),
});

export const ZCloudPutBlob = ZCloudBase.merge(
  z.object({
    key: ZKey,
    size: z.number().int().min(0),
  }),
);

export const ZCloudGetBlob = ZCloudBase.merge(
  z.object({
    key: ZKey,
    offset: z.number().int().optional(),
    length: z.number().int().optional(),
  }),
);

export const ZCloudDeleteBlob = ZCloudBase.merge(
  z.object({
    key: ZKey,
  }),
);

export const ZCloudListBlobs = ZCloudBase.merge(
  z.object({
    prefix: ZKey,
    marker: ZKey.optional(),
  }),
);

export const ZCloudGetMetadata = ZCloudBase.merge(
  z.object({
    key: ZKey,
  }),
);
