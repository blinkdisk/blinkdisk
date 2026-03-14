import { ZEmail } from "@schemas/shared/email";
import { ZLanguage } from "@schemas/shared/language";
import { ZFirstAndLastName, ZFirstName, ZLastName } from "@schemas/shared/name";
import { ZTheme } from "@schemas/shared/theme";
import { z } from "zod";

export const ZUpdateUser = z.object({
  firstName: ZFirstName,
  lastName: ZLastName,
  email: ZEmail,
});

export type ZUpdateUserType = z.infer<typeof ZUpdateUser>;

export const ZUpdateUserServer = z.object({
  name: ZFirstAndLastName.optional(),
  language: ZLanguage.optional(),
});

export type ZUpdateUserServerType = z.infer<typeof ZUpdateUserServer>;

export const ZUpdatePreferences = z.object({
  theme: ZTheme,
  language: ZLanguage,
});

export type ZUpdatePreferencesType = z.infer<typeof ZUpdatePreferences>;
