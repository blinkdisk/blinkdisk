import { LANGUAGE_CODES } from "@blinkdisk/config/language";
import { z } from "zod";

export const ZLanguage = z.enum(LANGUAGE_CODES);
