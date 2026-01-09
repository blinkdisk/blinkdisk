import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Space } from "@cloud/classes/space";
import { Vault } from "@cloud/classes/vault";
import { consumeSpace } from "@cloud/utils/space";
import { ZCloudDeleteBlob } from "@schemas/cloud";

export async function deleteBlob(
  durableObject: InstanceType<typeof Vault>,
  data: any,
  storage: DurableObjectStorage,
  space: DurableObjectNamespace<Space>,
) {
  const {
    data: payload,
    error: parseError,
    success,
  } = ZCloudDeleteBlob.safeParse(data);

  if (!success)
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
    0,
  );

  if (error) return { error };
  return { space: spaceStats };
}
