import { Polar } from "@polar-sh/sdk";

export const getPolar = (environment: string, token: string | undefined) => {
  return new Polar({
    server: environment as "production" | "sandbox",
    accessToken: token!,
  });
};
