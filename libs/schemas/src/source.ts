import { z } from "zod";

export const ZSourceType = z.enum(["directory", "file", "symlink"]);
export type SourceType = z.infer<typeof ZSourceType>;

export const ZKopiaEntryType = z.enum(["d", "f", "s"]);
export type KopiaEntryType = z.infer<typeof ZKopiaEntryType>;

export function sourceTypeFromKopiaEntryType(
  type: string | null | undefined,
): SourceType | undefined {
  switch (type) {
    case "d":
      return "directory";
    case "f":
      return "file";
    case "s":
      return "symlink";
    default:
      return undefined;
  }
}

export function kopiaEntryTypeFromSourceType(
  type: SourceType | null | undefined,
): KopiaEntryType {
  switch (type) {
    case "file":
      return "f";
    case "symlink":
      return "s";
    default:
      return "d";
  }
}

export function sourceTypeWithFallback(
  type: SourceType | string | null | undefined,
): SourceType {
  return ZSourceType.safeParse(type).success
    ? (type as SourceType)
    : "directory";
}

export function isFileLikeSource(type: SourceType | null | undefined): boolean {
  return type === "file" || type === "symlink";
}

const ZSourceName = z.string().min(1).max(100);
const ZSourceEmoji = z.emoji().min(1);

export const ZCreateSourceForm = z.object({
  name: ZSourceName,
  emoji: ZSourceEmoji.optional(),
  path: z.string().min(1),
  type: ZSourceType,
});

export type ZCreateSourceFormType = z.infer<typeof ZCreateSourceForm>;
