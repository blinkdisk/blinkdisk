import { store } from "@electron/store";
import { safeStorage, session } from "electron";

export async function migrateAuthV1() {
  if (store.get("auth.cookie")) return;

  const cookies = await session.defaultSession.cookies.get({});

  const sessionCookies = cookies.filter((c) =>
    c.name.startsWith("__Secure-blinkdisk.session_token"),
  );

  if (sessionCookies.length === 0) return;

  const cookieData: Record<string, { value: string; expires: string }> = {};

  for (const cookie of sessionCookies) {
    const newName = cookie.name.replace(
      "__Secure-blinkdisk.",
      "__Secure-auth.",
    );
    cookieData[newName] = {
      value: cookie.value,
      expires: cookie.expirationDate
        ? new Date(cookie.expirationDate * 1000).toISOString()
        : "",
    };
  }

  const encrypted = safeStorage
    .encryptString(JSON.stringify(cookieData))
    .toString("base64");

  store.set("auth.cookie", encrypted);
}
