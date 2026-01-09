export async function hashFolder({
  hostName,
  userName,
  path,
}: {
  hostName: string;
  userName: string;
  path: string;
}) {
  const payload = `${hostName}@${userName}:${path}`;

  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-1", enc.encode(payload));
  return Array.from(new Uint8Array(hash))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
