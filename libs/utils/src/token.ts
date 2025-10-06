import jwt from "@tsndr/cloudflare-worker-jwt";

type JWTPayload = {
  storageId: string;
};

const options = {
  aud: "cloud.blinkdisk.com",
  iss: "api.blinkdisk.com",
} as const;

export async function generateServiceToken(
  payload: JWTPayload,
  privateKey: string,
) {
  return await jwt.sign(
    {
      ...payload,
      ...options,
    },
    privateKey,
    {
      algorithm: "RS256",
    },
  );
}

export async function verifyServiceToken(token: string, publicKey: string) {
  const data = await jwt.verify<JWTPayload>(token, publicKey, {
    algorithm: "RS256",
  });

  if (!data) return null;

  if (data.payload.aud !== options.aud) return null;
  if (data.payload.iss !== options.iss) return null;

  return data.payload;
}

export function getStorageId(headers: Headers) {
  const header = headers.get("Authorization");
  if (!header) return null;

  const token = header?.replace("Bearer ", "");
  const data = jwt.decode<JWTPayload>(token);

  if (!data?.payload) return null;
  return data.payload.storageId;
}
