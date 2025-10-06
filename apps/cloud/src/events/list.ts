import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { Storage } from "@cloud/index";
import { ZCloudListBlobs } from "@schemas/cloud";

export async function listBlobs(
  durableObject: InstanceType<typeof Storage>,
  data: any,
) {
  const { data: payload, error: parseError } = ZCloudListBlobs.safeParse(data);
  if (parseError || !payload)
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
