import { z } from "zod";

export const ZProfileUserName = z.string().min(1).max(255);
export const ZProfileHostName = z.string().min(1).max(255);
