import { parseContent } from "@marketing/blog/content";
import Content from "@marketing/components/blog/Content.astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

describe("StackedBar server rendering", () => {
  it("renders the CMS chart as a named figure, proportional bar, and visible data table", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Content, {
      props: {
        nodes: parseContent(`<StackedBar title="Backup capacity" unit="GB">
<BarSegment label="Documents" value="180" />
<BarSegment label="Photos" value="20" />
</StackedBar>`).nodes,
        cmsUrl: "https://cms.example.com",
        faqs: [],
      },
    });
    expect(html).toMatch(/<figure\b/);
    expect(html).toMatch(/<figcaption\b[^>]*>Backup capacity<\/figcaption>/);
    expect(html).toContain('aria-label="Backup capacity"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("width:90%");
    expect(html).toContain("width:10%");
    expect(html).toMatch(/<table\b/);
    expect(html).toMatch(/<th\b[^>]*scope="col"[^>]*>Segment<\/th>/);
    expect(html).toMatch(/<th\b[^>]*scope="col"[^>]*>Capacity \(GB\)<\/th>/);
    expect(html).toMatch(
      /<th\b[^>]*scope="row"[^>]*>[\s\S]*?Documents[\s\S]*?<\/th>/,
    );
    expect(html).toContain("180 GB");
    expect(html).toContain("20 GB");
    expect(html).toMatch(
      /<tfoot\b[\s\S]*?Total[\s\S]*?200 GB[\s\S]*?<\/tfoot>/,
    );
    expect(html).not.toMatch(/<script|<astro-island|<StackedBar|<BarSegment/i);
  });
  it("preserves small decimal capacities without rounding them away", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Content, {
      props: {
        nodes: parseContent(`<StackedBar title="Small capacities" unit="GB">
<BarSegment label="First" value="0.000001" />
<BarSegment label="Second" value="0.000002" />
</StackedBar>`).nodes,
        cmsUrl: "https://cms.example.com",
        faqs: [],
      },
    });
    expect(html).toContain("0.000001 GB");
    expect(html).toContain("0.000002 GB");
    expect(html).toContain("0.000003 GB");
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  it("totals decimal segments exactly rather than exposing floating point artifacts", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Content, {
      props: {
        nodes: parseContent(`<StackedBar title="Decimal capacities" unit="GB">
<BarSegment label="First" value="999999999999.999999" />
<BarSegment label="Second" value="0.000001" />
</StackedBar>`).nodes,
        cmsUrl: "https://cms.example.com",
        faqs: [],
      },
    });
    expect(html).toContain("999,999,999,999.999999 GB");
    expect(html).toContain("1,000,000,000,000 GB");
  });
  it("escapes literal text and renders charts nested in supported CMS blocks", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Content, {
      props: {
        nodes: parseContent(`<Callout variant="info">

<StackedBar title="Capacity &amp; storage" unit="&lt;GB&gt;">
<BarSegment label="&lt;img src=x onerror=alert(1)&gt;" value="1" />
</StackedBar>

</Callout>

<StackedBar title="Capacity &amp; storage" unit="GB">
${'<BarSegment label="Used" value="1" />'.repeat(8)}
</StackedBar>`).nodes,
        cmsUrl: "https://cms.example.com",
        faqs: [],
      },
    });
    expect(html.match(/<figure\b/g)).toHaveLength(2);
    expect(html.match(/<table\b/g)).toHaveLength(2);
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("1 &lt;GB&gt;");
    expect(html).toContain("8 GB");
    expect(html).not.toMatch(/<img|<script|<astro-island|NaN|Infinity/);
  });
});
