import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { Vault } from "@cloud/classes/vault";
import { ZCloudListBlobs } from "@schemas/cloud";

export async function listBlobs(
  durableObject: InstanceType<typeof Vault>,
  data: any,
) {
  const {
    data: payload,
    error: parseError,
    success,
  } = ZCloudListBlobs.safeParse(data);

  if (!success)
    return { error: parseError.message || "Failed to validate payload" };

  const res = await durableObject.s3.send(
    new ListObjectsCommand({
      Bucket: durableObject.bucket,
      Prefix: `${durableObject.id}/${payload.prefix}`,
      MaxKeys: 1000,
      ...(payload.marker && { Marker: payload.marker }),
    }),
  );

  return {
    nextMarker: res.NextMarker,
    blobs:
      res.Contents?.map((blob) => ({
        key: blob.Key?.slice(durableObject.id.length + 1),
        modified: blob.LastModified,
        size: blob.Size,
      })) || [],
  };
}
