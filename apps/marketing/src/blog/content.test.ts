import { readdirSync, readFileSync } from "node:fs";
import { parseContent, safeStyle } from "@marketing/blog/content";
import { serializeStructuredData } from "@marketing/utils/structured-data";
import { describe, expect, it } from "vitest";

describe("CMS content", () => {
  it("renders Markdown, components, tables, duplicate headings, HTML, and code without evaluation", () => {
    const content = parseContent(
      '# Hello\n\n## Same\n\n## Same\n\n<Summary>\n**Bold** and [link](https://example.com).\n</Summary>\n\n<div style="color: red; padding: 12px">HTML</div>\n\n| A | B |\n|---|---|\n| C | D |\n\n```bash\necho hello\n```\n\n```mermaid\nflowchart LR\n A --> B\n```',
    );
    expect(content.headings.map((heading) => heading.slug)).toEqual([
      "hello",
      "same",
      "same-1",
    ]);
    expect(content.nodes.map((node) => node.tag)).toContain("table");
    expect(content.nodes.map((node) => node.tag)).toContain("Mermaid");
    expect(content.readingTime).toBeGreaterThanOrEqual(1);
  });
  it.each([
    'import X from "x";\n\n# Post',
    '{globalThis.fetch("https://evil.example")}',
    "<Summary {...props} />",
    "<Image src={url} />",
    "<script>alert(1)</script>",
    '<div onclick="alert(1)">x</div>',
    '<iframe src="https://example.com" />',
    '<a href="javascript:alert(1)">x</a>',
    '<a href="//evil.example">x</a>',
    '<div style="background-color: url(https://evil.example)">x</div>',
    "<Unknown />",
    '<Callout variant="unknown" />',
    '<Image src="https://example.com/a.png" />',
    "<Checklist><div>Invalid child</div></Checklist>",
  ])("rejects executable or unsupported input: %s", (source) =>
    expect(() => parseContent(source)).toThrow());
  it.each([
    "color: e\\78pression(alert(1))",
    "background-color: u/**/rl(x)",
    "behavior: x",
    'color: red; @import "x"',
    'background-color: image-set("x")',
  ])("rejects unsafe CSS: %s", (style) =>
    expect(() => safeStyle(style)).toThrow());
  it("preserves both migration fixtures and their interactive components", () => {
    const directory = new URL(
      "../../scripts/directus/fixtures/",
      import.meta.url,
    );
    for (const filename of readdirSync(directory)) {
      const fixture = JSON.parse(
        readFileSync(new URL(filename, directory), "utf8"),
      );
      const source = fixture.content.replace(
        'src="local:src/assets/screenshots/light.png"',
        'src="https://example.com/screenshot.png"',
      );
      const parsed = parseContent(source);
      expect(parsed.headings.length).toBeGreaterThan(5);
      expect(parsed.nodes.some((node) => node.tag === "Summary")).toBe(true);
      if (fixture.slug.startsWith("backup-photos")) {
        expect(parsed.nodes.some((node) => node.tag === "Checklist")).toBe(
          true,
        );
        expect(parsed.nodes.some((node) => node.tag === "BlogFaq")).toBe(true);
        expect(parsed.nodes.some((node) => node.tag === "Mermaid")).toBe(true);
      }
    }
  });
  it("keeps CMS metadata inside JSON-LD scripts while preserving the original data", () => {
    const metadata = {
      headline: '</script><script>alert("metadata")</script>',
      description: "<!-- untrusted description -->",
      author: { name: "A < B" },
    };
    const serialized = serializeStructuredData(metadata);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(metadata);
  });
});
