import { config } from "dotenv";
import fs from "fs";

config({
  path: "../../.env",
});

const whitelist = [
  "LOGSNAG_PRIVATE_KEY",
  "RESEND_API_KEY",
  "RESEND_DOMAIN",
  "CLOUD_JWT_PUBLIC_KEY",
  "CLOUD_S3_ENDPOINT",
  "CLOUD_S3_ENDPOINT_AMS",
  "CLOUD_S3_ENDPOINT_LUX",
  "CLOUD_S3_ENDPOINT_YUL",
  "CLOUD_S3_ENDPOINT_YVR",
  "CLOUD_S3_REGION",
  "CLOUD_S3_BUCKET",
  "CLOUD_S3_KEY_ID",
  "CLOUD_S3_KEY_SECRET",
];

let env = "";

for (const key of whitelist) {
  if (!process.env[key]) continue;
  env += `${key}=${JSON.stringify(process.env[key])}\n`;
}

if (process.env.DATABASE_URL)
  env += `WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=${JSON.stringify(process.env.DATABASE_URL)}\n`;

fs.writeFileSync(".env", env);
