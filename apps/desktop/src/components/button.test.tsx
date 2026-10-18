import { Button } from "@blinkdisk/ui/button";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("Button loading state", () => {
  it("disables the underlying button while loading", () => {
    const markup = renderToStaticMarkup(<Button loading>Backup all</Button>);

    expect(markup).toMatch(/<button[^>]*disabled/);
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("disabled:opacity-100");
    expect(markup).not.toContain("disabled:opacity-50");
    expect(markup).toContain("Backup all");
  });

  it("preserves an explicitly disabled button after loading ends", () => {
    const markup = renderToStaticMarkup(
      <Button disabled loading={false}>
        Backup all
      </Button>,
    );

    expect(markup).toMatch(/<button[^>]*disabled/);
  });
});
