import { contentImageUrl } from "@marketing/blog/media";
import { describe, expect, it } from "vitest";

describe("CMS inline images", () => {
  it("resolves CMS assets for Markdown and component images without redirecting site-local images", () => {
    expect(
      contentImageUrl("/assets/file-id?width=900", "https://cms.example.com"),
    ).toBe("https://cms.example.com/assets/file-id?width=900");
    expect(contentImageUrl("/brand/logo.png", "https://cms.example.com")).toBe(
      "/brand/logo.png",
    );
    expect(
      contentImageUrl(
        "https://other.example.com/image.png",
        "https://cms.example.com",
      ),
    ).toBe("https://other.example.com/image.png");
  });
});
