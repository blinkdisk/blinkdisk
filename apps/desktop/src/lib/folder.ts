export async function hashFolder({
  deviceId,
  profileId,
  path,
}: {
  deviceId: string;
  profileId: string;
  path: string;
}) {
  const payload = `${profileId}@${deviceId}:${path}`;

  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-1", enc.encode(payload));
  return Array.from(new Uint8Array(hash))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
