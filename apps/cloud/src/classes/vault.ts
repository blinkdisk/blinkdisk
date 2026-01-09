import { DurableObject } from "cloudflare:workers";

export class Vault extends DurableObject<Cloudflare.Env> {
  async setStorage(data: Record<string, any>) {
    for (const [key, value] of Object.entries(data)) {
      await this.ctx.storage.put(key, value);
    }
  }

  async backup() {
    const storage = await this.ctx.storage.list();

    return {
      storage: Object.fromEntries(storage),
    };
  }
}
