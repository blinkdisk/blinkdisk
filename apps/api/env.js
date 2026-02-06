/* eslint-disable no-undef */
import { config } from "dotenv";
import fs from "fs";

config({
  path: "../../.env",
});

const whitelist = [
  "MARKETING_URL",
  "BETTER_AUTH_SECRET",
  "CLOUD_JWT_PRIVATE_KEY",
  "LOGSNAG_PRIVATE_KEY",
  "POLAR_ENVIRONMENT",
  "POLAR_TOKEN",
  "POLAR_WEBHOOK_SECRET",
  "POSTHOG_DESKTOP_KEY",
  "ENDORSELY_ORGANIZATION_ID",
  "ENDORSELY_PRIVATE_KEY",
  "EMAIL_PROVIDER",
  "EMAIL_DOMAIN",
  "SMTP_URL",
  "PLUNK_URL",
  "PLUNK_SECRET_KEY",
];

let env = "";

for (const key of whitelist) {
  if (!process.env[key]) continue;
  env += `${key}=${JSON.stringify(process.env[key])}\n`;
}

if (process.env.DATABASE_URL)
  env += `WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=${JSON.stringify(process.env.DATABASE_URL)}\n`;

fs.writeFileSync(".env", env);
