import { z } from "zod";

export const ZTheme = z.enum(["light", "dark", "system"]);
