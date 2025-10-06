import { z } from "zod";

export const ZRestoreDirectory = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ZIP"),
    filePath: z
      .string()
      .min(1)
      .refine((path) => path.endsWith(".zip"), {
        message: "invalid_zip_extension",
      }),
    compress: z.boolean(),
  }),
  z.object({
    type: z.literal("UNPACKED"),
    directoryPath: z.string().min(1),
    confirmed: z.boolean(),
  }),
]);

export type ZRestoreDirectoryType = z.infer<typeof ZRestoreDirectory>;
