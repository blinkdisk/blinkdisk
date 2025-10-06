import { log } from "@electron/log";
import { safeStorage } from "electron";

export type EncryptedString = {
  type: "ENCRYPTED" | "PLAIN";
  data: string;
};

export function encryptString(data: string): EncryptedString {
  if (!safeStorage.isEncryptionAvailable()) {
    return {
      type: "PLAIN",
      data,
    };
  }

  const encrypted = safeStorage.encryptString(data).toString("base64");

  return {
    type: "ENCRYPTED",
    data: encrypted,
  };
}

export function decryptString<Fallback>(
  data: EncryptedString,
  fallback: Fallback,
) {
  if (data.type === "PLAIN") return data.data;

  if (!safeStorage.isEncryptionAvailable()) {
    log.error("Decryption is not available, but tried decrypt data");
    return fallback;
  }

  return safeStorage.decryptString(Buffer.from(data.data, "base64"));
}

export type EncryptedConfig = {
  iv: string;
  salt: string;
  cipher: string;
};

export async function encryptVaultConfig({
  password,
  config,
}: {
  password: string;
  config: object;
}): Promise<EncryptedConfig> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encodedData = encoder.encode(JSON.stringify(config));

  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData,
  );

  return {
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
    cipher: btoa(String.fromCharCode(...new Uint8Array(cipher))),
  };
}

export async function decryptVaultConfig({
  password,
  encrypted,
}: {
  password: string;
  encrypted: EncryptedConfig;
}): Promise<object> {
  const decoder = new TextDecoder();

  const salt = Uint8Array.from(atob(encrypted.salt), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(encrypted.iv), (c) => c.charCodeAt(0));
  const cipher = Uint8Array.from(atob(encrypted.cipher), (c) =>
    c.charCodeAt(0),
  );

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher,
  );

  return JSON.parse(decoder.decode(decrypted));
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
