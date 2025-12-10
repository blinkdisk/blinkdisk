import xior from "xior";

const client = xior.create({
  baseURL: "blinkdiskapp://vault/",
});

export function vaultApi(vaultId?: string) {
  if (!client.config) client.config = {};
  if (!client.config?.headers) client.config.headers = {};
  client.config.headers["vault-id"] = vaultId;

  return client;
}
