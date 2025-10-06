import { z } from "zod";

export const ZFirstName = z.string().min(1).max(50);
export const ZLastName = z.string().min(1).max(50);
export const ZFirstAndLastName = z.string().min(3).max(100);
