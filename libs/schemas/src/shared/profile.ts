import { z } from "zod";

export const ZKopiaUserName = z.string().min(1).max(255);
export const ZKopiaHostName = z.string().min(1).max(255);
