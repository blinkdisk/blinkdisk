import { parse } from "twemoji-parser";

export function getEmojiUrl(emoji: string) {
  return parse(emoji)[0]?.url;
}
