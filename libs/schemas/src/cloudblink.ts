import { ZVaultId } from "@schemas/shared/id";
import { z } from "zod";

export const ZDeleteCloudBlinkVault = z.object({
  vaultId: ZVaultId,
});

export const ZGetCloudBlinkToken = z.object({
  vaultId: ZVaultId,
});
