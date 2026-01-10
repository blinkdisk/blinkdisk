import {
  DeleteObjectsCommand,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { deleteBlob } from "@cloud/events/delete";
import { getBlob } from "@cloud/events/get";
import { listBlobs } from "@cloud/events/list";
import { getMetadata } from "@cloud/events/metadata";
import { putBlob } from "@cloud/events/put";
import { scheduleVaultAlarm } from "@cloud/utils/alarm";
import { pickS3Endpoint } from "@cloud/utils/server";
import { ZCloudBase } from "@schemas/cloud";
import { getVaultId } from "@utils/token";
import { tryCatch } from "@utils/try-catch";
import { DurableObject } from "cloudflare:workers";

export class Vault extends DurableObject<Cloudflare.Env> {
  id: string = "unknown";
  bucket: string;
  rateLimit: RateLimit;
  sessions: Map<WebSocket, { [key: string]: string }>;
  s3: S3Client;

  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env);

    this.sessions = new Map();
    this.bucket = env.CLOUD_S3_BUCKET;
    this.rateLimit = env.RATE_LIMIT;

    this.ctx.getWebSockets().forEach((ws) => {
      let attachment = ws.deserializeAttachment();
      if (attachment) {
        this.sessions.set(ws, { ...attachment });
        this.id = attachment?.vaultId;
      }
    });

    // Initialize once with the default endpoint
    this.s3 = new S3Client({
      region: env.CLOUD_S3_REGION,
      endpoint: env.CLOUD_S3_ENDPOINT,
      credentials: {
        accessKeyId: env.CLOUD_S3_KEY_ID,
        secretAccessKey: env.CLOUD_S3_KEY_SECRET,
      },
    });

    this.ctx.blockConcurrencyWhile(async () => {
      const endpoint = await pickS3Endpoint(env);

      // Update the client with the new endpoint
      this.s3 = new S3Client({
        region: env.CLOUD_S3_REGION,
        endpoint,
        credentials: {
          accessKeyId: env.CLOUD_S3_KEY_ID,
          secretAccessKey: env.CLOUD_S3_KEY_SECRET,
        },
      });

      const alarm = await this.ctx.storage.getAlarm();
      if (!alarm) await scheduleVaultAlarm(this.ctx.storage);
    });
  }

  async init(spaceId: string) {
    await this.ctx.storage.put("spaceId", spaceId);
  }

  async fetch(request: Request): Promise<Response> {
    const vaultId = getVaultId(request.headers);
    if (!vaultId)
      return new Response("Failed to parse vault id", { status: 500 });
    this.id = vaultId!;

    const webSocketPair = new WebSocketPair();

    const [client, server] = Object.values(webSocketPair);
    if (!client || !server)
      return new Response("Failed to create WebSocket pair", { status: 500 });

    this.ctx.acceptWebSocket(server);

    const id = crypto.randomUUID();
    server.serializeAttachment({ id, vaultId });

    this.sessions.set(server, { id });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, raw: ArrayBuffer | string) {
    const [data] = tryCatch(() => JSON.parse(raw.toString()));
    if (!data)
      return ws.send(JSON.stringify({ error: "Failed to parse message" }));

    const {
      data: base,
      error: parseError,
      success: parseSuccess,
    } = ZCloudBase.safeParse(data);

    if (!parseSuccess)
      return ws.send(
        JSON.stringify({
          error: parseError.message || "Failed to validate message",
        }),
      );

    const { success } = await this.rateLimit.limit({
      key: this.id,
    });

    if (!success)
      return ws.send(
        JSON.stringify({
          responseId: base.requestId,
          error: "too many requests",
        }),
      );

    let response: any = null;
    switch (data.type) {
      case "PUT_BLOB":
        response = await putBlob(this, data, this.ctx.storage, this.env.SPACE);
        break;
      case "GET_BLOB":
        response = await getBlob(this, data, this.ctx.storage);
        break;
      case "DELETE_BLOB":
        response = await deleteBlob(
          this,
          data,
          this.ctx.storage,
          this.env.SPACE,
        );
        break;
      case "LIST_BLOBS":
        response = await listBlobs(this, data);
        break;
      case "GET_METADATA":
        response = await getMetadata(this, data);
        break;
      default:
        response = { error: "Invalid event type" };
    }

    if (ws.readyState !== WebSocket.OPEN) return;

    return ws.send(
      JSON.stringify({
        ...response,
        responseId: base.requestId,
      }),
    );
  }

  async webSocketClose(ws: WebSocket) {
    ws.close();
    this.sessions.delete(ws);
  }

  async delete(vaultId: string, updateSpace: boolean) {
    let marker: string | null = null;
    while (true) {
      const res = (await this.s3.send(
        new ListObjectsCommand({
          Bucket: this.bucket,
          Prefix: `${vaultId}/`,
          MaxKeys: 1000,
          ...(marker && { Marker: marker }),
        }),
      )) as ListObjectsCommandOutput;

      if (res.Contents?.length) {
        await this.s3.send(
          new DeleteObjectsCommand({
            Bucket: this.bucket,
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

    if (updateSpace) {
      const spaceId = await this.ctx.storage.get<string>("spaceId");
      const currentBytes =
        (await this.ctx.storage.get<number>("currentBytes")) || 0;

      if (spaceId && currentBytes) {
        const stub = this.env.SPACE.getByName(spaceId);
        await stub.substract(currentBytes);
      }
    }

    // Delete this durable object itself
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
  }

  async alarm() {
    await this.ctx.storage.put("downloadedBytes", 0);
    await this.ctx.storage.delete("downloadedBytesReported");
    await scheduleVaultAlarm(this.ctx.storage);
  }
}
