import {
  ZAccountEmail,
  ZAccountFirstName,
  ZAccountFullName,
  ZAccountLanguage,
  ZAccountLastName,
  ZAccountTimeZone,
} from "@schemas/accounts";
import { z } from "zod";

export const ZLogin = z.object({
  email: ZAccountEmail,
});

export type ZLoginType = z.infer<typeof ZLogin>;

export const ZRegister = z.object({
  firstName: ZAccountFirstName,
  lastName: ZAccountLastName,
  email: ZAccountEmail,
});

export type ZRegisterType = z.infer<typeof ZRegister>;

export const ZRegisterForm = ZRegister.extend(
  z.object({ terms: z.boolean() }).shape,
).refine((val) => !!val.terms, {
  error: "terms_required",
  path: ["terms"],
});

export type ZRegisterFormType = z.infer<typeof ZRegisterForm>;

export const ZRegisterServer = z.object({
  name: ZAccountFullName,
  email: ZAccountEmail,
  language: ZAccountLanguage,
  timeZone: ZAccountTimeZone.optional(),
});

export type ZRegisterServerType = z.infer<typeof ZRegisterServer>;

export const ZMagicCode = z.object({
  code: z.string().min(10).max(10),
});

export type ZMagicCodeType = z.infer<typeof ZMagicCode>;
