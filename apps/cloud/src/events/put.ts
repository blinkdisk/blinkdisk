import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Space } from "@cloud/classes/space";
import { Storage } from "@cloud/classes/storage";
import { consumeSpace } from "@cloud/utils/space";
import { ZCloudPutBlob } from "@schemas/cloud";

export async function putBlob(
  durableObject: InstanceType<typeof Storage>,
  data: any,
  storage: DurableObjectStorage,
  space: DurableObjectNamespace<Space>,
) {
  const { data: payload, error: parseError } = ZCloudPutBlob.safeParse(data);
  if (parseError || !payload)
    return { error: parseError.message || "Failed to validate payload" };

  await durableObject.s3.send(
    new DeleteObjectCommand({
      Bucket: durableObject.bucket,
      Key: `${durableObject.id}/${payload.key}`,
    }),
  );

  const { error, space: spaceStats } = await consumeSpace(
    storage,
    space,
    payload.key,
    payload.size,
  );

  if (error) return { error };

  const url = await getSignedUrl(
    durableObject.s3,
    new PutObjectCommand({
      Bucket: durableObject.bucket,
      Key: `${durableObject.id}/${payload.key}`,
      ContentLength: payload.size,
    }),
    {
      expiresIn: 60 * 15,
    },
  );

  return { url, space: spaceStats };
}
