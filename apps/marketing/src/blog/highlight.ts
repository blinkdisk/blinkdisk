import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import typescript from "shiki/langs/typescript.mjs";
import dark from "shiki/themes/github-dark.mjs";
import light from "shiki/themes/github-light.mjs";

let highlighter: ReturnType<typeof createHighlighterCore> | undefined;
export async function highlight(code: string, language: string) {
  highlighter ??= createHighlighterCore({
    themes: [dark, light],
    langs: [bash, javascript, json, typescript],
    engine: createJavaScriptRegexEngine(),
  }).catch((error) => {
    highlighter = undefined;
    throw error;
  });
  const instance = await highlighter;
  const aliases: Record<string, string> = {
    sh: "bash",
    shell: "bash",
    js: "javascript",
    ts: "typescript",
  };
  const lang = aliases[language] ?? language;
  return instance.codeToHtml(code, {
    lang: instance.getLoadedLanguages().includes(lang) ? lang : "text",
    themes: { light: "github-light", dark: "github-dark" },
    transformers: [
      {
        pre(node) {
          node.properties.class = `${String(node.properties.class ?? "")} astro-code`;
        },
      },
    ],
  });
}
