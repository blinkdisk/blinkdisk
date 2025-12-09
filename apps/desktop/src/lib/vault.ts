import xior from "xior";

export function vaultApi(vaultId?: string) {
  return xior.create({
    baseURL: `blinkdiskapp://vault/`,
    headers: {
      "Vault-Id": vaultId,
    },
  });
}
