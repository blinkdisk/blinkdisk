import { BlogContentError, parseContent } from "@marketing/blog/content";
import { describe, expect, it } from "vitest";

describe("StackedBar CMS content", () => {
  it("parses literal chart metadata and positive segment values", () => {
    const { nodes } = parseContent(`
<StackedBar title="Backup capacity" unit="GB">
  <BarSegment label="Documents" value="180" />
  <BarSegment label="Photos" value="20.5" />
</StackedBar>

Caption stays ordinary prose.
`);
    expect(nodes[0]).toEqual({
      tag: "StackedBar",
      props: { title: "Backup capacity", unit: "GB" },
      children: [
        {
          tag: "BarSegment",
          props: { label: "Documents", value: "180" },
          children: [],
        },
        {
          tag: "BarSegment",
          props: { label: "Photos", value: "20.5" },
          children: [],
        },
      ],
    });
    expect(nodes[1]?.tag).toBe("p");
  });
  it.each([
    '<StackedBar title={"Capacity"} unit="GB"><BarSegment label="Used" value="1" /></StackedBar>',
    '<StackedBar title="Capacity" unit="GB" {...props}><BarSegment label="Used" value="1" /></StackedBar>',
    '<StackedBar title="Capacity" unit="GB"><BarSegment label="Used" value={180} /></StackedBar>',
    '<StackedBar title="Capacity" unit="GB"><BarSegment label="Used" value="[180]" /></StackedBar>',
    '<StackedBar title="Capacity" unit="GB" style="color:red"><BarSegment label="Used" value="1" /></StackedBar>',
    '<StackedBar title="Capacity" unit="GB" class="hidden"><BarSegment label="Used" value="1" /></StackedBar>',
    '<StackedBar title="Capacity" unit="GB"><BarSegment label="Used" value="1" color="red" /></StackedBar>',
    '<StackedBar title="Capacity" unit="GB"><BarSegment label="Used" value="1" onmouseover="alert(1)" /></StackedBar>',
    '<StackedBar title="Capacity" unit="GB">\n{JSON.parse("[]")}\n</StackedBar>',
    '<StackedBar title="Capacity" unit="GB"><BarSegment label="Used" value="1"></StackedBar>',
  ])("rejects expressions, styling, and malformed author input: %s", (source) => {
    expect(() => parseContent(source)).toThrow(BlogContentError);
  });
  it("accepts one to eight segments and the inclusive numeric bounds", () => {
    const smallest = parseContent(
      '<StackedBar title="Capacity" unit="GB"><BarSegment label="Smallest" value="0.000001" /></StackedBar>',
    );
    expect(smallest.nodes[0]?.children[0]?.props.value).toBe("0.000001");
    const largest = parseContent(
      '<StackedBar title="Capacity" unit="GB"><BarSegment label="Largest" value="1000000000000" /></StackedBar>',
    );
    expect(largest.nodes[0]?.children[0]?.props.value).toBe("1000000000000");
    const eight = parseContent(
      `<StackedBar title="Capacity" unit="GB">${'<BarSegment label="Used" value="1" />'.repeat(8)}</StackedBar>`,
    );
    expect(eight.nodes[0]?.children).toHaveLength(8);
  });
  it.each([
    "0",
    "-1",
    "NaN",
    "Infinity",
    "1e309",
    "1000000000001",
    "1000000000000.000001",
    "0.0000001",
    "",
    " ",
    "0x10",
    "1_000",
    "1e3",
  ])("rejects non-decimal or out-of-bounds capacity %j with its source line", (value) => {
    const source = `# Capacity\n\n<StackedBar title="Capacity" unit="GB">\n  <BarSegment label="Used" value="${value}" />\n</StackedBar>`;
    expect(() => parseContent(source)).toThrow(BlogContentError);
    expect(() => parseContent(source)).toThrow(/BarSegment value.*line 4/);
  });
  it.each([
    [
      '<StackedBar unit="GB"><BarSegment label="Used" value="1" /></StackedBar>',
      /StackedBar title/,
    ],
    [
      '<StackedBar title=" " unit="GB"><BarSegment label="Used" value="1" /></StackedBar>',
      /StackedBar title/,
    ],
    [
      `<StackedBar title="${"a".repeat(161)}" unit="GB"><BarSegment label="Used" value="1" /></StackedBar>`,
      /StackedBar title/,
    ],
    [
      '<StackedBar title="Capacity"><BarSegment label="Used" value="1" /></StackedBar>',
      /StackedBar unit/,
    ],
    [
      '<StackedBar title="Capacity" unit><BarSegment label="Used" value="1" /></StackedBar>',
      /StackedBar unit/,
    ],
    [
      `<StackedBar title="Capacity" unit="${"a".repeat(25)}"><BarSegment label="Used" value="1" /></StackedBar>`,
      /StackedBar unit/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB"><BarSegment value="1" /></StackedBar>',
      /BarSegment label/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB"><BarSegment label=" " value="1" /></StackedBar>',
      /BarSegment label/,
    ],
    [
      `<StackedBar title="Capacity" unit="GB"><BarSegment label="${"a".repeat(121)}" value="1" /></StackedBar>`,
      /BarSegment label/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB"><BarSegment label="Used" /></StackedBar>',
      /BarSegment requires value/,
    ],
    [
      '<StackedBar title="Capacity" title="Other" unit="GB"><BarSegment label="Used" value="1" /></StackedBar>',
      /Duplicate attribute/,
    ],
  ])("rejects missing or malformed chart metadata: %s", (source, message) => {
    expect(() => parseContent(source)).toThrow(BlogContentError);
    expect(() => parseContent(source)).toThrow(message);
    expect(() => parseContent(source)).toThrow(/line 1/);
  });
  it.each([
    [
      '<BarSegment label="Used" value="1" />',
      /BarSegment must be a direct child of StackedBar/,
    ],
    [
      '<div><BarSegment label="Used" value="1" /></div>',
      /BarSegment must be a direct child of StackedBar/,
    ],
    [
      'Text <StackedBar title="Capacity" unit="GB"><BarSegment label="Used" value="1" /></StackedBar>',
      /StackedBar must be a block/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB" />',
      /StackedBar requires 1 to 8 BarSegment/,
    ],
    [
      `<StackedBar title="Capacity" unit="GB">${'<BarSegment label="Used" value="1" />'.repeat(9)}</StackedBar>`,
      /StackedBar requires 1 to 8 BarSegment/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB">\nText\n<BarSegment label="Used" value="1" />\n</StackedBar>',
      /StackedBar accepts only BarSegment/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB"><div><BarSegment label="Used" value="1" /></div></StackedBar>',
      /BarSegment must be a direct child/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB">\n<BarSegment label="Used" value="1"><span>Hidden</span></BarSegment>\n</StackedBar>',
      /BarSegment cannot contain children/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB"><StackedBar title="Nested" unit="GB"><BarSegment label="Used" value="1" /></StackedBar></StackedBar>',
      /StackedBar accepts only BarSegment/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB"><BarSegment label="Used" value="1000000000000" /><BarSegment label="Extra" value="0.000001" /></StackedBar>',
      /StackedBar total must not exceed/,
    ],
    [
      '<StackedBar title="Capacity" unit="GB">\n\n[hidden]: https://example.com\n\n<BarSegment label="Used" value="1" />\n</StackedBar>',
      /StackedBar accepts only BarSegment/,
    ],
  ])("rejects invalid chart structure: %s", (source, message) => {
    expect(() => parseContent(source)).toThrow(BlogContentError);
    expect(() => parseContent(source)).toThrow(message);
    expect(() => parseContent(source)).toThrow(/line \d+/);
  });
});
