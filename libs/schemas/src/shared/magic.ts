import { z } from "zod";

export const ZCode = z.string().min(10).max(10);
