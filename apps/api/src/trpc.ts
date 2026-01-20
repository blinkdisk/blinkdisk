import { Context } from "@api/context";
import { CustomError } from "@utils/error";
import { captureException } from "@api/lib/posthog";
import { initTRPC } from "@trpc/server";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { ZodError } from "zod";

const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error, ctx }) => {
    if (error.cause instanceof ZodError || error.cause instanceof CustomError)
      return {
        ...shape,
        data: {
          ...shape.data,
          code:
            error.cause && error.cause instanceof CustomError
              ? error.cause.code
              : error.code,
        },
      };

    if (ctx)
      ctx.waitUntil(
        captureException(error, ctx.account?.id, {
          path: ctx.req.path,
          method: ctx.req.method,
          url: ctx.req.url,
          headers: ctx.req.header(),
        }),
      );

    return {
      message: "INTERNAL_SERVER_ERROR",
      code: TRPC_ERROR_CODES_BY_KEY.INTERNAL_SERVER_ERROR,
      data: {
        code: "INTERNAL_SERVER_ERROR",
      },
    };
  },
});

export const procedure = t.procedure;
export const router = t.router;
