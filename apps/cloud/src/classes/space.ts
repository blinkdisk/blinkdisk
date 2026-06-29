import { DurableObject } from "cloudflare:workers";
import { database } from "@blinkdisk/db/index";
import { account, space as spaceTable } from "@blinkdisk/db/schema";
import { sendEmail } from "@blinkdisk/utils/email";
import { logsnag } from "@blinkdisk/utils/logsnag";
import { scheduleSpaceAlarm } from "@cloud/utils/alarm";
import { eq } from "drizzle-orm";

export class Space extends DurableObject<Cloudflare.Env> {
  db: ReturnType<typeof database>;

  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env);
    this.db = database(this.env.HYPERDRIVE.connectionString);

    this.ctx.blockConcurrencyWhile(async () => {
      const alarm = await this.ctx.storage.getAlarm();
      if (!alarm) await scheduleSpaceAlarm(this.ctx.storage);
    });
  }

  async init(spaceId: string, capacity: number) {
    await this.ctx.storage.put("spaceId", spaceId);
    await this.ctx.storage.put("capacity", capacity);
  }

  async consume(delta: number) {
    const capacity = await this.getCapacity();

    const oldUsedBytes = (await this.ctx.storage.get<number>("usedBytes")) || 0;
    const newUsedBytes = oldUsedBytes + delta;

    if (delta > 0 && newUsedBytes > capacity)
      return {
        error: "STORAGE_FULL",
      };

    await this.ctx.storage.put("usedBytes", newUsedBytes);

    return {
      space: {
        used: newUsedBytes,
        capacity,
      },
    };
  }

  async subtract(delta: number) {
    const used = (await this.ctx.storage.get<number>("usedBytes")) || 0;
    await this.ctx.storage.put("usedBytes", Math.max(0, used - delta));
  }

  async getCapacity() {
    return (await this.ctx.storage.get<number>("capacity")) || 0;
  }

  async getUsed() {
    return (await this.ctx.storage.get<number>("usedBytes")) || 0;
  }

  async updateCapacity(capacity: number) {
    await this.ctx.storage.put("capacity", capacity);
    await this.ctx.storage.put("notifications", []);
  }

  async alarm() {
    const id = await this.ctx.storage.get<string>("spaceId");
    if (!id) return;

    const used = await this.getUsed();
    const capacity = await this.getCapacity();

    await this.db.update(spaceTable).set({ used }).where(eq(spaceTable.id, id));

    const percentage = used / capacity;

    const notifications =
      (await this.ctx.storage.get<number[]>("notifications")) || [];

    for (const threshold of [0.98, 0.9, 0.8, 0.7]) {
      if (percentage < threshold) continue;
      if (notifications.includes(threshold)) break;

      await logsnag({
        icon: "📦",
        title: "Storage threshold reached",
        description: `Storage ${id} is ${percentage.toLocaleString(undefined, {
          style: "percent",
        })} full.`,
        channel: "storages",
      });

      const [accountRecord] = await this.db
        .select({ email: account.email, language: account.language })
        .from(spaceTable)
        .innerJoin(account, eq(account.id, spaceTable.accountId))
        .where(eq(spaceTable.id, id))
        .limit(1);

      if (accountRecord) {
        if (threshold >= 0.98) await sendEmail("storageFull", accountRecord);
        else
          await sendEmail("storageThreshold", accountRecord, {
            percentage: Math.round(percentage * 100),
          });
      }

      notifications.push(threshold);
      break;
    }

    await this.ctx.storage.put("notifications", notifications);
  }
}
