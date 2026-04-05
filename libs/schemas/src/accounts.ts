import { LANGUAGE_CODES } from "@blinkdisk/constants/language";
import { z } from "zod";

export const ZAccountId = z.string().min(1);

export const ZAccountEmail = z.string().email();

export const ZAccountFirstName = z.string().min(1).max(50);

export const ZAccountLastName = z.string().min(1).max(50);

export const ZAccountFullName = z.string().min(3).max(100);

export const ZAccountLanguage = z.enum(LANGUAGE_CODES);

export const ZAccountTimeZone = z.string();

export const ZUpdateAccount = z.object({
  firstName: ZAccountFirstName,
  lastName: ZAccountLastName,
  email: ZAccountEmail,
});

export type ZUpdateAccountType = z.infer<typeof ZUpdateAccount>;
