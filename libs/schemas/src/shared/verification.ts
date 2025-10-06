import { z } from "zod";

export const ZVerificationCode = z.string().min(6).max(6);
