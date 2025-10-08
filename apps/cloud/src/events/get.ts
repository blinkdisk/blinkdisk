import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Storage } from "@cloud/index";
import { getFileCache } from "@cloud/utils/space";
import { ZCloudGetBlob } from "@schemas/cloud";
import { logsnag } from "@utils/logsnag";

// 1GB Minimum egress limit
const MINIMUM_EGRESS_LIMIT = 1000 * 1000 * 1000;

export async function getBlob(
  durableObject: InstanceType<typeof Storage>,
  data: any,
  storage: DurableObjectStorage,
) {
  const {
    data: payload,
    error: parseError,
    success,
  } = ZCloudGetBlob.safeParse(data);

  if (!success)
    return { error: parseError.message || "Failed to validate payload" };

  const fileCache = await getFileCache(storage, payload.key);
  const fileSize = fileCache.size;

  const offset = payload.offset || 0;
  const length = payload.length || 0;

  let additionalEgress = fileSize;
  if (length > 0) additionalEgress = length;
  else if (offset > 0) additionalEgress = fileSize - offset;

  const oldDownloadedBytes =
    (await storage.get<number>("downloadedBytes")) || 0;
  const newDownloadedBytes = oldDownloadedBytes + additionalEgress;

  const currentBytes = (await storage.get<number>("currentBytes")) || 0;
  let egressLimit = currentBytes * 5;

  if (egressLimit < MINIMUM_EGRESS_LIMIT) egressLimit = MINIMUM_EGRESS_LIMIT;
  if (newDownloadedBytes > egressLimit) {
    const reported = await storage.get<boolean>("downloadedBytesReported");
    if (!reported) {
      await logsnag({
        icon: "🚫",
        title: "Download limit reached",
        description: `${durableObject.id} has reached the download limit of ${(egressLimit / 1000 / 1000 / 1000).toLocaleString()} GB`,
        channel: "storages",
      });

      await storage.put("downloadedBytesReported", true);
    }

    return { error: "DOWNLOAD_LIMIT_REACHED" };
  }

  await storage.put("downloadedBytes", oldDownloadedBytes);

  const url = await getSignedUrl(
    durableObject.s3,
    new GetObjectCommand({
      Bucket: durableObject.bucket,
      Key: `${durableObject.id}/${payload.key}`,
      ...((payload.length || 0) > 0 || (payload.offset || 0) > 0
        ? {
            Range:
              (payload.length || 0) > 0
                ? `bytes=${payload.offset}-${(payload.offset || 0) + (payload.length || 0) - 1}`
                : `bytes=${payload.offset}-`,
          }
        : {}),
    }),
    {
      expiresIn: 60 * 15,
    },
  );

  return { url };
}
