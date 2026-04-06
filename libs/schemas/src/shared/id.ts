import { z } from "zod";

export const ZAnyExternalId = z.string().min(1);

export const ZVaultId = z.string().min(1);

export const ZAccountId = z.string().min(1);
