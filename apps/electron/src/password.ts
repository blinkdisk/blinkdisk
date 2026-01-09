import {
  decryptString,
  EncryptedString,
  encryptString,
} from "@electron/encryption";
import { store } from "@electron/store";
import { Vault } from "@electron/vault";
import crypto from "node:crypto";

export function setPasswordCache({
  vaultId,
  password,
}: {
  vaultId: string;
  password: string;
}) {
  const encrypted = encryptString(password);
  store.set(`passwords.${vaultId}`, encrypted);
  Vault.onCacheChanged();
}

export function getPasswordCache({ vaultId }: { vaultId: string }) {
  const encrypted = store.get(`passwords.${vaultId}`) as
    | EncryptedString
    | null
    | undefined;

  if (!encrypted) return null;
  return decryptString(encrypted, null);
}

export async function hashPassword({ password }: { password: string }) {
  return new Promise<string>((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");

    return crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

export async function comparePassword({
  password,
  hash,
}: {
  password: string;
  hash: string;
}) {
  return new Promise<boolean>((resolve, reject) => {
    const [salt, key] = hash.split(":");
    crypto.scrypt(password, salt || "", 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key == derivedKey.toString("hex"));
    });
  });
}
