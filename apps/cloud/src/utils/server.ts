import { coloServerMapping } from "@config/server";
import { tryCatch } from "@utils/try-catch";

const withTimeout = async (url: string, timeout = 1000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.text();
  } finally {
    clearTimeout(id);
  }
};

export async function pickS3Endpoint(env: Cloudflare.Env) {
  const [res] = await tryCatch(() =>
    withTimeout("https://www.cloudflare.com/cdn-cgi/trace"),
  );

  if (!res) return env.CLOUD_S3_ENDPOINT;

  let colo = res.match(/^colo=(.+)/m)?.[1] as keyof typeof coloServerMapping;
  if (!colo) return env.CLOUD_S3_ENDPOINT;

  let server = coloServerMapping[colo];
  if (!server) return env.CLOUD_S3_ENDPOINT;

  const override = env[`CLOUD_S3_ENDPOINT_${server}`];
  if (!override) return env.CLOUD_S3_ENDPOINT;

  return override;
}
