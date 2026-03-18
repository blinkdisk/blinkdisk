import { LANGUAGE_CODES } from "@blinkdisk/constants/language";
import { z } from "zod";

export const ZLanguage = z.enum(LANGUAGE_CODES);
