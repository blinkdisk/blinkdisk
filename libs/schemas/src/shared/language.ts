import { languageCodes } from "@config/language";
import { z } from "zod";

export const ZLanguage = z.enum(languageCodes);
