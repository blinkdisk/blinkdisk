import {
  createId as legidCreateId,
  verifyId as legidVerifyId,
} from "legid-sync";
import { customAlphabet } from "nanoid";

const prefixes = {
  Account: "acct",
  AuthMethod: "auth",
  Session: "sesh",
  Verification: "ver",
  Queue: "que",
  Device: "dev",
  Profile: "prf",
  // Old vaults might also be prefixed with "strg"
  Vault: "vlt",
  Config: "cfg",
  Folder: "fld",
  Space: "spc",
  Subscription: "sub",
} as const;

export type Prefix = keyof typeof prefixes;

const salt = "blinkdisk:";
const length = 21;

export const codeGenerator = customAlphabet(
  "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
  length,
);

export function generateId(prefix?: Prefix) {
  const id = legidCreateId({
    // The field is called "approximateLength" as even numbers are rounded down
    // to the nearest uneven number. We use 21, so it's always going to be 21.
    approximateLength: length,
    salt: salt,
  });

  if (!prefix) return id;
  return `${prefixes[prefix]}_${id}`;
}

export function verifyId(id: string) {
  const parts = id.split("_");
  const trimmed = parts.at(-1) || id;

  const expectedLength: number = length;

  // Length should always be 21 (see comment above)
  if (trimmed.length !== expectedLength) return false;

  return legidVerifyId(trimmed, {
    salt: salt,
  });
}

export function generateCode(length?: number) {
  return codeGenerator(length);
}
