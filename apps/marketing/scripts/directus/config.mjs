import { createHmac, randomBytes } from "node:crypto";

export function resolveCmsUrl(value) {
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "DIRECTUS_URL must be an origin without credentials, a path, query, or fragment.",
    );
  if (
    !["http:", "https:"].includes(url.protocol) ||
    (url.protocol !== "https:" &&
      !["localhost", "127.0.0.1"].includes(url.hostname))
  )
    throw new Error("Directus must use HTTPS outside local development.");
  return url.origin;
}
export function setupPreviewSecret(environment, stored, existingPreviewUrl) {
  const secret = environment || stored;
  if (secret) {
    if (secret.length < 32)
      throw new Error(
        "BLOG_PREVIEW_SECRET must contain at least 32 characters; use a randomly generated secret.",
      );
    return secret;
  }
  if (existingPreviewUrl)
    throw new Error(
      "An existing preview is configured. Provide the current BLOG_PREVIEW_SECRET explicitly; setup will not silently rotate it.",
    );
  return randomBytes(32).toString("hex");
}
export function previewLinkKey(secret) {
  return createHmac("sha256", secret)
    .update("blinkdisk:blog-preview:link:v1")
    .digest("hex");
}
export function serializeEnvironment(values) {
  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== "string" || /["\\\r\n\0]/.test(value))
      throw new Error(
        `Unsupported environment value for ${name}; quotes, backslashes, and control characters are not supported.`,
      );
  }
  return `${Object.entries(values)
    .map(([name, value]) => `${name}="${value}"`)
    .join("\n")}\n`;
}
export function mediaExtension(type) {
  const extensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  const normalized = type.split(";")[0].trim().toLowerCase();
  const extension = Object.hasOwn(extensions, normalized)
    ? extensions[normalized]
    : undefined;
  if (!extension)
    throw new Error("Unsupported downloaded blog image MIME type.");
  return extension;
}
