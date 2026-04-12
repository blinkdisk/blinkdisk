import { storeToken } from "@electron/auth";
import { store } from "@electron/store";
import { SessionResponse } from "better-auth/client";
import { safeStorage } from "electron";

export async function migrateAuthV2() {
  const encrypted = store.get("auth.cookie") as string;
  if (!encrypted) return;

  const decrypted = safeStorage.decryptString(Buffer.from(encrypted, "base64"));
  if (!decrypted) return;

  const parsed = JSON.parse(decrypted) as {
    [name: string]: {
      value: string;
      expires: string;
    };
  };

  for (const [name, cookie] of Object.entries(parsed)) {
    if (!name.startsWith("__Secure-auth")) continue;
    const cookieString = `__Secure-auth.session_token=${cookie.value}`;

    const res = await fetch(`${process.env.API_URL}/api/auth/get-session`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieString,
      },
    });

    if (!res.ok) continue;

    const data = (await res.json()) as SessionResponse;

    const accountId = data?.user?.id;
    if (!accountId) continue;

    storeToken(accountId, cookie.value);
    store.set(`accounts.${accountId}.data`, data.user);
    store.set(`accounts.${accountId}.session`, data.session);
  }
}
