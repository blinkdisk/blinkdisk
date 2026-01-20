import { getPostHog, posthog } from "@api/lib/posthog";
import { FREE_SPACE_AVAILABLE } from "@config/space";
import { DB, dialect } from "@db";
import { ZLogin, ZRegisterServer } from "@schemas/auth";
import { ZUpdateUserServer } from "@schemas/settings";
import { sendEmail } from "@utils/email";
import { generateCode, generateId, Prefix } from "@utils/id";
import { logsnag } from "@utils/logsnag";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { magicLink, multiSession } from "better-auth/plugins";
import { Kysely } from "kysely";
import { StandardAdapter, validator } from "validation-better-auth";

const cookieSettings = {
  attributes: {
    sameSite: "None",
  },
} as const;

export const auth = (
  databaseUrl: string,
  space: DurableObjectNamespace<undefined>,
  db: Kysely<DB>,
) => {
  return betterAuth({
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
      dialect: dialect(databaseUrl),
      type: "postgres",
    },
    trustedOrigins: [process.env.DESKTOP_URL!, "blinkdiskapp://frontend"],
    advanced: {
      cookiePrefix: "blinkdisk",
      useSecureCookies: true,
      cookies: {
        session_token: cookieSettings,
        session_data: cookieSettings,
        dont_remember: cookieSettings,
      },
      generateId: ({ model }) => {
        return generateId(
          `${model === "session" ? "Session" : model === "user" ? "Account" : model === "account" ? "AuthMethod" : ""}` as Prefix,
        );
      },
      ipAddress: {
        ipAddressHeaders: [
          "cf-connecting-ip",
          "x-forwarded-for",
          "x-client-ip",
        ],
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: (
          {
            email,
            token,
          }: {
            email: string;
            token: string;
          },
          req: Request | undefined,
        ) =>
          sendEmail(
            "magic",
            {
              email,
              language: req?.headers.get("X-BlinkDisk-Language")
                ? req?.headers.get("X-BlinkDisk-Language")
                : "en",
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
      validator([
        { path: "/sign-up/email", adapter: StandardAdapter(ZRegisterServer) },
        { path: "/sign-in/email", adapter: StandardAdapter(ZLogin) },
        { path: "/update-user", adapter: StandardAdapter(ZUpdateUserServer) },
      ]),
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
          after: async (account) => {
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

            const stub = space.getByName(spaceId);
            await (
              stub as unknown as {
                init: (id: string, capacity: number) => Promise<void>;
              }
            ).init(spaceId, FREE_SPACE_AVAILABLE);
          },
        },
      },
    },
  });
};
