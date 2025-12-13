import {
  DeleteObjectsCommand,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { FREE_SPACE_AVAILABLE } from "@config/space";
import { Database } from "@db/index";
import { sendEmail } from "@utils/email";

export async function sendCleanupEmails(db: Database, scheduledTime: number) {
  const start = new Date(scheduledTime);
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 7);

  const subscriptions = await db
    .selectFrom("Subscription")
    .innerJoin("Account", "Account.id", "Subscription.accountId")
    .select([
      "Subscription.id",
      "Subscription.cleanupAt",
      "Account.email",
      "Account.language",
    ])
    .where("Subscription.cleanupAt", ">", start)
    .where("Subscription.cleanupAt", "<", end)
    .execute();

  for (const subscription of subscriptions) {
    const daysLeft = subscription.cleanupAt
      ? Math.round(
          (subscription.cleanupAt?.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    await sendEmail("cleanup", subscription, {
      daysLeft,
    });
  }
}

export async function cleanup(
  db: Database,
  scheduledTime: number,
  env: CloudflareBindings,
) {
  const end = new Date(scheduledTime);
  const start = new Date(end.getTime() - 1000 * 60 * 60 * 24);

  const spaces = await db
    .selectFrom("Subscription")
    .innerJoin("Space", "Space.subscriptionId", "Subscription.id")
    .select(["Space.id"])
    .where("Subscription.cleanupAt", ">", start)
    .where("Subscription.cleanupAt", "<", end)
    .execute();

  if (!spaces.length) return;

  const storages = await db
    .selectFrom("Storage")
    .select(["id"])
    .where("provider", "=", "BLINKDISK_CLOUD")
    .where(
      "spaceId",
      "in",
      spaces.map((space) => space.id),
    )
    .where("status", "=", "ACTIVE")
    .execute();

  if (!storages.length) return;

  for (const space of spaces) {
    const stub = env.SPACE.getByName(space.id);
    await stub.updateCapacity(FREE_SPACE_AVAILABLE, 0);
  }

  await db
    .updateTable("Space")
    .set({ used: String(0), capacity: FREE_SPACE_AVAILABLE.toString() })
    .where(
      "id",
      "in",
      spaces.map((space) => space.id),
    )
    .execute();

  await db
    .updateTable("Storage")
    .set({ status: "DELETED" })
    .where(
      "id",
      "in",
      storages.map((s) => s.id),
    )
    .execute();

  await db
    .updateTable("Vault")
    .set({ status: "DELETED" })
    .where(
      "storageId",
      "in",
      storages.map((storage) => storage.id),
    )
    .where("status", "=", "ACTIVE")
    .execute();

  const s3 = new S3Client({
    region: env.CLOUD_S3_REGION,
    endpoint: env.CLOUD_S3_ENDPOINT,
    credentials: {
      accessKeyId: env.CLOUD_S3_KEY_ID,
      secretAccessKey: env.CLOUD_S3_KEY_SECRET,
    },
  });

  for (const storage of storages) {
    const stub = env.STORAGE.getByName(storage.id);
    await stub.setDeleted();

    let marker: string | null = null;
    while (true) {
      const res = (await s3.send(
        new ListObjectsCommand({
          Bucket: env.CLOUD_S3_BUCKET,
          Prefix: `${storage.id}/`,
          MaxKeys: 1000,
          ...(marker && { Marker: marker }),
        }),
      )) as ListObjectsCommandOutput;

      if (res.Contents?.length) {
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: env.CLOUD_S3_BUCKET,
            Delete: {
              Objects: res.Contents.map((c) => ({
                Key: c.Key,
              })),
            },
          }),
        );
      }

      if (res.IsTruncated && res.Contents?.length)
        marker = res.Contents.at(-1)?.Key || null;
      else break;
    }
  }
}
