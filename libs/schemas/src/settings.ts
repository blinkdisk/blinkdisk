import { ZEmail } from "#shared/email";
import { ZLanguage } from "#shared/language";
import { ZFirstAndLastName, ZFirstName, ZLastName } from "#shared/name";
import { ZTheme } from "#shared/theme";
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
