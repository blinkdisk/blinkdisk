import { languageCodes } from "@blinkdisk/config/language";
import { z } from "zod";

export const ZLanguage = z.enum(languageCodes);
