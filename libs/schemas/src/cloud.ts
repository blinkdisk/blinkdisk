import { z } from "zod";

const ZKey = z
  .string()
  .regex(
    /^(?!.*(?:\.\.\/|\.\.\\)).+$/,
    "Path must not include directory traversal patterns",
  );

export const ZCloudBase = z.object({
  requestId: z.string(),
});

export const ZCloudPutBlob = ZCloudBase.extend(
  z.object({
    key: ZKey,
    size: z.number().int().min(0),
  }).shape,
);

export const ZCloudGetBlob = ZCloudBase.extend(
  z.object({
    key: ZKey,
    offset: z.number().int().optional(),
    length: z.number().int().optional(),
  }).shape,
);

export const ZCloudDeleteBlob = ZCloudBase.extend(
  z.object({
    key: ZKey,
  }).shape,
);

export const ZCloudListBlobs = ZCloudBase.extend(
  z.object({
    prefix: ZKey,
    marker: ZKey.optional(),
  }).shape,
);

export const ZCloudGetMetadata = ZCloudBase.extend(
  z.object({
    key: ZKey,
  }).shape,
);
