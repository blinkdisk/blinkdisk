import { z } from "zod";

export const ZFolderName = z.string().min(1).max(100);
export const ZFolderEmoji = z.string().emoji().min(1);
