import {
  decryptString,
  EncryptedString,
  encryptString,
} from "@electron/encryption";
import { store } from "@electron/store";

export function setPasswordCache({
  vaultId,
  password,
}: {
  vaultId: string;
  password: string;
}) {
  const encrypted = encryptString(password);
  store.set(`passwords.${vaultId}`, encrypted);
}

export function getPasswordCache({ vaultId }: { vaultId: string }) {
  const encrypted = store.get(`passwords.${vaultId}`) as
    | EncryptedString
    | null
    | undefined;

  if (!encrypted) return null;
  return decryptString(encrypted, null);
}
