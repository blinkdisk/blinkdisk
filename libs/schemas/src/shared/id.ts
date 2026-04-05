import { z } from "zod";

export const ZAnyExternalId = z.string().min(1);
