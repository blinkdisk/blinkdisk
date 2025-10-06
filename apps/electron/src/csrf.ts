import crypto from "crypto";

export function generateCSRFToken(sessionId: string, signingKey: string) {
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(sessionId);
  return hmac.digest("hex");
}
