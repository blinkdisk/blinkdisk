import { ZEmail } from "@schemas/shared/email";
import { ZLanguage } from "@schemas/shared/language";
import { ZCode } from "@schemas/shared/magic";
import { ZFirstAndLastName, ZFirstName, ZLastName } from "@schemas/shared/name";
import { ZTimezone } from "@schemas/shared/timezone";
import { z } from "zod";

export const ZLogin = z.object({
  email: ZEmail,
});

export type ZLoginType = z.infer<typeof ZLogin>;

export const ZRegister = z.object({
  firstName: ZFirstName,
  lastName: ZLastName,
  email: ZEmail,
});

export type ZRegisterType = z.infer<typeof ZRegister>;

export const ZRegisterForm = ZRegister.merge(
  z.object({ terms: z.boolean() }),
).refine((val) => !!val.terms, {
  message: "terms_required",
  path: ["terms"],
});

export type ZRegisterFormType = z.infer<typeof ZRegisterForm>;

export const ZRegisterServer = z.object({
  name: ZFirstAndLastName,
  email: ZEmail,
  language: ZLanguage,
  timeZone: ZTimezone.optional(),
});

export type ZRegisterServerType = z.infer<typeof ZRegisterServer>;

export const ZMagicCode = z.object({
  code: ZCode,
});

export type ZMagicCodeType = z.infer<typeof ZMagicCode>;
