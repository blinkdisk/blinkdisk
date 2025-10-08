import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { Storage } from "@cloud/index";
import { ZCloudGetMetadata } from "@schemas/cloud";

export async function getMetadata(
  durableObject: InstanceType<typeof Storage>,
  data: any,
) {
  const {
    data: payload,
    error: parseError,
    success,
  } = ZCloudGetMetadata.safeParse(data);

  if (!success)
    return { error: parseError.message || "Failed to validate payload" };

  const res = await durableObject.s3.send(
    new HeadObjectCommand({
      Bucket: durableObject.bucket,
      Key: `${durableObject.id}/${payload.key}`,
    }),
  );

  return {
    size: res.ContentLength,
    modified: res.LastModified,
  };
}
