import { customAlphabet } from "nanoid";

const prefixes = {
  Account: "acct",
  AuthMethod: "auth",
  Session: "sesh",
  Verification: "ver",
  Queue: "que",
  Device: "dev",
  Profile: "prf",
  Storage: "strg",
  Vault: "vlt",
  Config: "cfg",
  Folder: "fld",
  Space: "spc",
  Subscription: "sub",
} as const;

export type Prefix = keyof typeof prefixes;

const length = 21;
const minIdLength = 21;
const maxIdLength = 21;

const pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

export const nanoid = customAlphabet(pool, length);
export const codeGenerator = customAlphabet(
  "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
  length,
);

export function generateId(prefix?: Prefix, length?: number) {
  if (!prefix) return nanoid(length);
  return `${prefixes[prefix]}_${nanoid(length)}`;
}

export function isValidId(id: string) {
  if (id.includes("_")) id = id.split("_").at(-1) ?? "";

  if (!/^[a-z0-9]*$/i.test(id)) return false;
  if (id.length < minIdLength || id.length > maxIdLength) return false;

  return true;
}

export function generateCode(length?: number) {
  return codeGenerator(length);
}
