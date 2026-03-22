import { getPostHog, posthog } from "@api/lib/posthog";
import { electron } from "@better-auth/electron";
import { APP_ID_ORIGIN } from "@blinkdisk/constants/app";
import {
  ELECTRON_CLIENT_ID,
  ELECTRON_COOKIE_PREFIX,
} from "@blinkdisk/constants/auth";
import {
  ENDORSELY_HEADER,
  LANGUAGE_HEADER,
  TIMEZONE_HEADER,
} from "@blinkdisk/constants/header";
import { DEFAULT_LANGUAGE_CODE } from "@blinkdisk/constants/language";
import { FREE_SPACE_AVAILABLE } from "@blinkdisk/constants/space";
import { DB, dialect } from "@blinkdisk/db/index";
import { sendEmail } from "@blinkdisk/utils/email";
import { generateCode, generateId, Prefix } from "@blinkdisk/utils/id";
import { logsnag } from "@blinkdisk/utils/logsnag";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { magicLink, multiSession } from "better-auth/plugins";
import { Kysely } from "kysely";
import { trackAffiliateSignup } from "./lib/affiliate";

const cookieSettings = {
  attributes: {
    sameSite: "None",
  },
} as const;

export const auth = (env: CloudflareBindings, db: Kysely<DB>) => {
  return betterAuth({
    baseURL: env.API_URL,
    appName: "BlinkDisk",
    basePath: "/api/auth",
    account: {
      modelName: "AuthMethod",
      fields: {
        accountId: "authMethodId",
        userId: "accountId",
      },
    },
    user: {
      modelName: "Account",
      additionalFields: {
        language: {
          type: "string",
          required: false,
        },
        timeZone: {
          type: "string",
          required: false,
        },
      },
    },
    session: {
      modelName: "Session",
      fields: {
        userId: "accountId",
      },
      // Backups should be able to run in the background for a long
      // time and not be interrupted by a user's session expiring.
      // Fresh age will not always be updated correctly, so we set
      // it to the maximum value of 400 days.
      expiresIn: 60 * 60 * 24 * 400,
      freshAge: 60 * 60 * 24,
    },
    verification: {
      modelName: "Verification",
    },
    database: {
      dialect: dialect(env.HYPERDRIVE.connectionString),
      type: "postgres",
    },
    trustedOrigins: [
      process.env.WEB_URL,
      process.env.DESKTOP_URL!,
      APP_ID_ORIGIN,
    ],
    advanced: {
      cookiePrefix: ELECTRON_COOKIE_PREFIX,
      useSecureCookies: true,
      cookies: {
        session_token: cookieSettings,
        session_data: cookieSettings,
        dont_remember: cookieSettings,
      },
      crossSubDomainCookies: {
        enabled: true,
        domain: new URL(env.WEB_URL).hostname.split(".").slice(-2).join('.'),
      },
      ipAddress: {
        ipAddressHeaders: [
          "cf-connecting-ip",
          "x-forwarded-for",
          "x-client-ip",
        ],
      },
      database: {
        generateId: ({ model }) => {
          return generateId(
            `${model === "session" ? "Session" : model === "user" ? "Account" : model === "account" ? "AuthMethod" : ""}` as Prefix,
          );
        },
      },
    },
    plugins: [
      electron({
        disableOriginOverride: true,
        cookiePrefix: ELECTRON_COOKIE_PREFIX,
        clientID: ELECTRON_CLIENT_ID,
      }) as Omit<ReturnType<typeof electron>, "hooks">,
      magicLink({
        sendMagicLink: ({ email, token }, ctx) =>
          sendEmail(
            "magic",
            {
              email,
              language: ctx?.request?.headers?.get(LANGUAGE_HEADER)
                ? ctx.request.headers.get(LANGUAGE_HEADER)
                : DEFAULT_LANGUAGE_CODE,
            },
            { code: [token.slice(0, 5), token.slice(5, 10)] },
          ),
        expiresIn: 60 * 60,
        generateToken: () => generateCode(10),
        storeToken: "hashed",
      }),
      multiSession({
        maximumSessions: 100,
      }),
    ],
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === "/sign-in/magic-link" && !ctx.body.name) {
          const account = await db
            .selectFrom("Account")
            .select(["id"])
            .where("email", "=", ctx.body.email)
            .executeTakeFirst();

          if (!account)
            throw new APIError("BAD_REQUEST", {
              message: "ACCOUNT_NOT_FOUND",
            });

          await posthog({
            distinctId: account.id,
            event: "account_login",
          });
        }
      }),
    },
    databaseHooks: {
      user: {
        create: {
          after: async (account, ctx) => {
            const spaceId = generateId("Space");

            await db
              .insertInto("Space")
              .values({
                id: spaceId,
                capacity: FREE_SPACE_AVAILABLE.toString(),
                used: "0",
                accountId: account.id,
              })
              .execute();

            const stub = env.SPACE.getByName(spaceId);
            await (
              stub as unknown as {
                init: (id: string, capacity: number) => Promise<void>;
              }
            ).init(spaceId, FREE_SPACE_AVAILABLE);

            const language = ctx?.request?.headers?.get(LANGUAGE_HEADER);
            const timeZone = ctx?.request?.headers?.get(TIMEZONE_HEADER);

            if (language || timeZone) {
              await db
                .updateTable("Account")
                .set({
                  ...(language ? { language } : {}),
                  ...(timeZone ? { timeZone } : {}),
                })
                .where("id", "=", account.id)
                .execute();
            }

            const posthog = getPostHog();

            posthog.identify({
              distinctId: account.id,
              properties: {
                name: account.name,
                email: account.email,
              },
            });

            posthog.capture({
              distinctId: account.id,
              event: "account_register",
              properties: {
                name: account.name,
                email: account.email,
              },
            });

            await posthog.shutdown();

            await logsnag({
              icon: "👋",
              title: "Account created",
              description: `${account.email} just registered.`,
              channel: "accounts",
            });

            const referralId = ctx?.request?.headers?.get(ENDORSELY_HEADER);
            if (referralId) await trackAffiliateSignup(env, referralId);
          },
        },
      },
    },
  });
};
