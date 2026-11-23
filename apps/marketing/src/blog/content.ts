import { capacityUnits } from "@marketing/blog/chart";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

type SourceNode = {
  type: string;
  value?: string;
  name?: string;
  depth?: number;
  ordered?: boolean;
  start?: number;
  checked?: boolean | null;
  url?: string;
  title?: string | null;
  alt?: string;
  lang?: string | null;
  align?: ("left" | "right" | "center" | null)[];
  identifier?: string;
  attributes?: { type: string; name?: string; value?: unknown }[];
  children?: SourceNode[];
  position?: { start: { line: number; column: number } };
};

export type ContentNode = {
  tag: string;
  props: Record<string, string | number | boolean>;
  children: ContentNode[];
  text?: string;
};
export type ParsedContent = {
  nodes: ContentNode[];
  headings: { depth: number; slug: string; text: string }[];
  readingTime: number;
};
export class BlogContentError extends Error {}

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
const htmlTags = new Set(
  "a abbr aside b blockquote br caption code col colgroup dd del details div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i img kbd li mark ol p pre s section small span strong sub summary sup table tbody td th thead tr u ul".split(
    " ",
  ),
);
const components: Record<string, string[]> = {
  Summary: ["class"],
  Callout: ["variant", "title", "class"],
  Image: ["src", "alt", "width", "height", "class"],
  BlogFaq: [],
  Checklist: ["title"],
  ChecklistItem: [],
  StackedBar: ["title", "unit"],
  BarSegment: ["label", "value"],
};
const htmlAttributes = new Set(
  "id class title style href src alt width height loading decoding colspan rowspan scope start open type".split(
    " ",
  ),
);
const nodeTags: Record<string, string> = {
  paragraph: "p",
  strong: "strong",
  emphasis: "em",
  delete: "del",
  blockquote: "blockquote",
  listItem: "li",
  thematicBreak: "hr",
  break: "br",
  inlineCode: "code",
  table: "table",
  tableRow: "tr",
  tableCell: "td",
};
const cssProperties = new Set(
  "color background-color border border-color border-width border-style border-radius padding padding-top padding-right padding-bottom padding-left margin margin-top margin-right margin-bottom margin-left display gap row-gap column-gap grid-template-columns grid-column flex flex-direction flex-wrap align-items justify-content width min-width max-width height min-height max-height font-size font-weight font-family line-height letter-spacing text-align text-decoration overflow overflow-x overflow-y opacity box-shadow white-space vertical-align".split(
    " ",
  ),
);

function safeUrl(value: string, image = false): string {
  const normalized = value.trim();
  if (
    Array.from(normalized).some(
      (character) =>
        character.charCodeAt(0) <= 32 ||
        character.charCodeAt(0) === 127 ||
        character === "\\",
    )
  ) {
    throw new BlogContentError(
      "URLs must not contain whitespace, control characters, or backslashes.",
    );
  }
  const relative = /^(?:\/(?!\/)|#)/.test(normalized);
  const absolute = image
    ? /^https:\/\//i.test(normalized)
    : /^(?:https?:\/\/|mailto:)/i.test(normalized);
  if (!relative && !absolute)
    throw new BlogContentError(
      "Unsupported URL protocol: use HTTPS or a site-relative URL.",
    );
  if (absolute && !normalized.startsWith("mailto:")) {
    try {
      new URL(normalized);
    } catch {
      throw new BlogContentError("Invalid absolute URL.");
    }
  }
  return normalized;
}

export function safeStyle(value: string): string {
  if (
    /[\\@{}<>]|\/\*|\*\//.test(value) ||
    /(?:url|expression|image-set|attr)\s*\(/i.test(value)
  ) {
    throw new BlogContentError(
      "Inline styles cannot contain URLs, escapes, comments, or executable expressions.",
    );
  }
  for (const declaration of value.split(";")) {
    if (!declaration.trim()) continue;
    const colon = declaration.indexOf(":");
    const property = declaration.slice(0, colon).trim().toLowerCase();
    if (
      colon < 0 ||
      !cssProperties.has(property) ||
      !declaration.slice(colon + 1).trim()
    ) {
      throw new BlogContentError(
        `Unsupported inline style property: ${property}`,
      );
    }
  }
  return value;
}

function textOf(node: SourceNode): string {
  return node.value ?? node.children?.map(textOf).join("") ?? "";
}

export function parseContent(source: string): ParsedContent {
  if (source.length > 500_000)
    throw new BlogContentError("Article content exceeds 500,000 characters.");
  let root: SourceNode;
  try {
    root = parser.parse(source) as SourceNode;
  } catch (error) {
    throw new BlogContentError(
      error instanceof Error ? error.message : "Invalid article syntax.",
    );
  }
  const headings: ParsedContent["headings"] = [];
  const definitions = new Map<string, SourceNode>();
  const slugs = new Set<string>();
  function collect(node: SourceNode) {
    if (node.type === "definition" && node.identifier)
      definitions.set(node.identifier.toLowerCase(), node);
    for (const child of node.children ?? []) collect(child);
  }
  collect(root);
  function fail(node: SourceNode, message: string): never {
    throw new BlogContentError(
      message + (node.position ? ` (line ${node.position.start.line})` : ""),
    );
  }
  function convert(
    node: SourceNode,
    depth = 0,
    parentName?: string,
  ): ContentNode {
    if (depth > 64) fail(node, "Content nesting is too deep.");
    if (node.name === "BarSegment" && node.children?.length)
      fail(
        node,
        "BarSegment cannot contain children; use label and value attributes.",
      );
    if (node.name === "BarSegment" && parentName !== "StackedBar")
      fail(node, "BarSegment must be a direct child of StackedBar.");
    if (node.name === "StackedBar" && parentName === "StackedBar")
      fail(node, "StackedBar accepts only BarSegment elements and whitespace.");
    if (node.name === "StackedBar" && node.type !== "mdxJsxFlowElement")
      fail(
        node,
        "StackedBar must be a block, separated from prose by blank lines.",
      );
    const result: ContentNode = { tag: "", props: {}, children: [] };
    if (
      ["mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"].includes(node.type)
    )
      fail(node, "Imports and JavaScript expressions are not supported.");
    if (node.type === "text") return { ...result, text: node.value ?? "" };
    if (node.type === "definition") return result;
    if (["footnoteDefinition", "footnoteReference"].includes(node.type))
      fail(
        node,
        "Footnotes are not supported; use ordinary links or a references section.",
      );
    result.children = (node.children ?? []).map((child) =>
      convert(child, depth + 1, node.name),
    );
    if (node.type === "root") return result;
    if (node.type === "heading") {
      result.tag = `h${node.depth}`;
      const text = textOf(node);
      const base =
        text
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s-]/gu, "")
          .trim()
          .replace(/\s+/g, "-") || "heading";
      let slug = base;
      for (let count = 1; slugs.has(slug); count++) slug = `${base}-${count}`;
      slugs.add(slug);
      result.props.id = slug;
      headings.push({ depth: node.depth ?? 2, slug, text });
    } else if (node.type === "list") {
      result.tag = node.ordered ? "ol" : "ul";
      if (node.ordered && node.start) result.props.start = node.start;
    } else if (node.type === "code") {
      result.tag = node.lang === "mermaid" ? "Mermaid" : "Code";
      result.text = node.value ?? "";
      result.props.language = node.lang ?? "text";
    } else if (
      ["link", "image", "linkReference", "imageReference"].includes(node.type)
    ) {
      const image = node.type.startsWith("image");
      const definition = node.identifier
        ? definitions.get(node.identifier.toLowerCase())
        : node;
      if (!definition?.url) fail(node, "Link or image reference is missing.");
      result.tag = image ? "img" : "a";
      result.props[image ? "src" : "href"] = safeUrl(definition.url, image);
      if (definition.title) result.props.title = definition.title;
      if (image) result.props.alt = node.alt ?? "";
    } else if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      const name = node.name ?? "";
      if (!htmlTags.has(name) && !Object.hasOwn(components, name))
        fail(node, `Unsupported element: ${name}`);
      result.tag = name;
      for (const attribute of node.attributes ?? []) {
        if (
          attribute.type !== "mdxJsxAttribute" ||
          !attribute.name ||
          (attribute.value !== null && typeof attribute.value !== "string")
        )
          fail(
            node,
            "Use literal attributes; spreads and expressions are not supported.",
          );
        const key = attribute.name === "className" ? "class" : attribute.name;
        const allowed = Object.hasOwn(components, name)
          ? components[name]?.includes(key)
          : htmlAttributes.has(key) ||
            /^aria-[a-z-]+$/.test(key) ||
            /^data-[a-z-]+$/.test(key);
        if (!allowed || /^on/i.test(key))
          fail(node, `Unsupported attribute: ${key}`);
        if (
          ["StackedBar", "BarSegment"].includes(name) &&
          Object.hasOwn(result.props, key)
        )
          fail(node, `Duplicate attribute: ${key}`);
        let value: string | boolean | number =
          attribute.value === null ? true : String(attribute.value);
        if (["src", "href"].includes(key))
          value = safeUrl(String(value), key === "src");
        if (key === "style") value = safeStyle(String(value));
        if (["width", "height", "colspan", "rowspan", "start"].includes(key)) {
          const number = Number(value);
          if (!Number.isInteger(number) || number < 1 || number > 20_000)
            fail(node, `Invalid numeric attribute: ${key}`);
          value = number;
        }
        if (name === "BarSegment" && key === "value") {
          const number = Number(value);
          if (
            typeof value !== "string" ||
            !/^\d+(?:\.\d{1,6})?$/.test(value) ||
            !Number.isFinite(number) ||
            number < 0.000001 ||
            number > 1_000_000_000_000 ||
            capacityUnits(value) > 1_000_000_000_000_000_000n
          )
            fail(
              node,
              "BarSegment value must be a decimal from 0.000001 to 1,000,000,000,000 with at most six decimal places.",
            );
        }
        result.props[key] = value;
      }
      if (name === "StackedBar" || name === "BarSegment") {
        const fields =
          name === "StackedBar"
            ? ([
                ["title", 160],
                ["unit", 24],
              ] as const)
            : ([["label", 120]] as const);
        for (const [key, limit] of fields) {
          const value = result.props[key];
          if (
            typeof value !== "string" ||
            !value.trim() ||
            value.length > limit
          )
            fail(
              node,
              `${name} ${key} must be non-empty text of at most ${limit} characters.`,
            );
          result.props[key] = value.trim();
        }
        if (name === "BarSegment" && typeof result.props.value !== "string")
          fail(node, "BarSegment requires value.");
      }
      if (name === "StackedBar") {
        for (const child of node.children ?? []) {
          if (
            child.name !== "BarSegment" &&
            !(child.type === "text" && !child.value?.trim())
          )
            fail(
              child,
              "StackedBar accepts only BarSegment elements and whitespace.",
            );
        }
        result.children = result.children.filter(
          (child) => child.tag === "BarSegment",
        );
        if (result.children.length < 1 || result.children.length > 8)
          fail(node, "StackedBar requires 1 to 8 BarSegment elements.");
        const total = result.children.reduce(
          (sum, child) => sum + capacityUnits(String(child.props.value)),
          0n,
        );
        if (total > 1_000_000_000_000_000_000n)
          fail(node, "StackedBar total must not exceed 1,000,000,000,000.");
      }
      if (
        name === "Callout" &&
        result.props.variant &&
        !["warning", "info"].includes(String(result.props.variant))
      )
        fail(node, "Callout variant must be warning or info.");
      if (
        name === "Image" &&
        (!result.props.src ||
          typeof result.props.alt !== "string" ||
          !result.props.alt.trim())
      )
        fail(node, "Image requires src and alt attributes.");
      if (
        name === "Checklist" &&
        result.children.some(
          (child) =>
            child.tag !== "ChecklistItem" &&
            (child.text === undefined || Boolean(child.text.trim())),
        )
      )
        fail(node, "Checklist must contain ChecklistItem elements.");
    } else if (nodeTags[node.type]) {
      result.tag = nodeTags[node.type] ?? "";
      if (
        node.type === "listItem" &&
        node.checked !== null &&
        node.checked !== undefined
      ) {
        result.children.unshift({
          tag: "Task",
          props: { checked: node.checked },
          children: [],
        });
      }
    } else fail(node, `Unsupported Markdown node: ${node.type}`);
    if (result.tag === "a") {
      const href = String(result.props.href ?? "");
      if (
        /^https?:\/\//i.test(href) &&
        new URL(href).hostname !== "blinkdisk.com"
      ) {
        result.props.target = "_blank";
        result.props.rel = "noopener noreferrer";
      }
    }
    if (result.tag === "img") result.props.loading = "lazy";
    if (node.type === "table") {
      result.children = result.children.map((row, index) => ({
        ...row,
        children: row.children.map(
          (cell, column): ContentNode => ({
            ...cell,
            tag: index === 0 ? "th" : "td",
            props: node.align?.[column]
              ? { style: `text-align:${node.align[column]}` }
              : {},
          }),
        ),
      }));
      const [header, ...body] = result.children;
      result.children = [
        ...(header ? [{ tag: "thead", props: {}, children: [header] }] : []),
        { tag: "tbody", props: {}, children: body },
      ];
    }
    return result;
  }
  const nodes = convert(root).children;
  function readingText(node: SourceNode): string {
    if (
      node.type === "break" ||
      (node.type === "mdxJsxTextElement" && node.name === "br")
    )
      return " ";
    if (node.value !== undefined) return node.value;
    const inline = [
      "paragraph",
      "heading",
      "strong",
      "emphasis",
      "delete",
      "link",
      "linkReference",
      "mdxJsxTextElement",
    ].includes(node.type);
    return (node.children ?? []).map(readingText).join(inline ? "" : " ");
  }
  const words = readingText(root).trim().split(/\s+/).filter(Boolean).length;
  return { nodes, headings, readingTime: Math.max(1, Math.ceil(words / 200)) };
}
