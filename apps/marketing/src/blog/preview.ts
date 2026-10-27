const encoder = new TextEncoder();
async function key(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export async function previewSession(secret: string, now = Date.now()) {
  const expires = String(Math.floor(now / 1000) + 3600);
  return (
    expires +
    "." +
    hex(
      await crypto.subtle.sign(
        "HMAC",
        await key(secret),
        encoder.encode(expires),
      ),
    )
  );
}
export async function validPreviewSession(
  value: string | undefined,
  secret: string,
  now = Date.now(),
) {
  if (!value || !secret) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [expires, signature] = parts;
  if (
    !expires ||
    !signature ||
    !/^\d+$/.test(expires) ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    return false;
  const seconds = Math.floor(now / 1000);
  if (Number(expires) <= seconds || Number(expires) > seconds + 3600)
    return false;
  const bytes = new Uint8Array(
    signature.match(/../g)?.map((part) => Number.parseInt(part, 16)) ?? [],
  );
  return crypto.subtle.verify(
    "HMAC",
    await key(secret),
    bytes,
    encoder.encode(expires),
  );
}
export async function validPreviewKey(value: string, secret: string) {
  if (!value || !secret) return false;
  const signingKey = await key(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    signingKey,
    encoder.encode(secret),
  );
  return crypto.subtle.verify(
    "HMAC",
    signingKey,
    signature,
    encoder.encode(value),
  );
}
