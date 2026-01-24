import { CoreError } from "@utils/error";
import xior from "xior";

const client = xior.create({
  baseURL: "blinkdiskapp://vault/",
});

client.interceptors.response.use(
  (result) => {
    const data = result.data;

    if (data && typeof data === "object" && data.error) {
      console.error(
        `Core error:`,
        data.code ? `[${data.code}]` : "",
        data.error,
      );

      return Promise.reject(
        new CoreError({
          message: data.error.toString(),
          ...(data.code && { code: data.code }),
        }),
      );
    }

    return result;
  },
  async (error) => {
    console.error(`Request error:`, error);
    return Promise.reject(error);
  },
);

export function vaultApi(vaultId?: string) {
  if (!client.config) client.config = {};
  if (!client.config?.headers) client.config.headers = {};
  client.config.headers["vault-id"] = vaultId;

  return client;
}
