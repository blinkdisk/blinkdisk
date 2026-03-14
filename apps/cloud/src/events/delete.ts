import { Space } from "#classes/space";
import { Vault } from "#classes/vault";
import { consumeSpace } from "#utils/space";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ZCloudDeleteBlob } from "@blinkdisk/schemas/cloud";

export async function deleteBlob(
  durableObject: InstanceType<typeof Vault>,
  data: unknown,
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
