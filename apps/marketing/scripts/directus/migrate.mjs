import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { api, cmsUrl, find, local, query, root } from "./client.mjs";
import { mediaExtension } from "./config.mjs";

const folder = local.DIRECTUS_BLOG_FOLDER;
if (!folder) throw new Error("Run cms:setup first.");
async function media(source) {
  let bytes;
  let type;
  if (source.startsWith("local:")) {
    bytes = readFileSync(root + source.slice(6));
    type = "image/png";
  } else {
    const response = await fetch(source, {
      signal: AbortSignal.timeout(60000),
      headers: { "User-Agent": "BlinkDisk-Blog-Migration/1.0" },
    });
    if (!response.ok)
      throw new Error(`Image download failed: ${response.status}`);
    bytes = new Uint8Array(await response.arrayBuffer());
    type =
      response.headers
        .get("content-type")
        ?.split(";")[0]
        ?.trim()
        .toLowerCase() ?? "";
  }
  const filename =
    "blog-" +
    createHash("sha256").update(bytes).digest("hex") +
    mediaExtension(type);
  const existing = await find("files", {
    folder: { _eq: folder },
    filename_download: { _eq: filename },
  });
  if (existing) return existing.id;
  const form = new FormData();
  form.set("folder", folder);
  form.set(
    "title",
    source
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "")
      .replaceAll("-", " ") ?? "Blog image",
  );
  form.set("description", `Original blog media: ${source}`);
  form.set("file", new Blob([bytes], { type }), filename);
  return (await api("/files", { method: "POST", body: form })).id;
}
for (const filename of readdirSync(
  new URL("./fixtures/", import.meta.url),
).filter((name) => name.endsWith(".json"))) {
  const fixture = JSON.parse(
    readFileSync(new URL(`./fixtures/${filename}`, import.meta.url), "utf8"),
  );
  if (
    (
      await api(
        "/items/blog_posts?" +
          query({
            filter: { slug: { _eq: fixture.slug } },
            fields: "id",
            limit: 1,
          }),
      )
    ).length
  ) {
    console.log(`Preserved existing post: ${fixture.slug}`);
    continue;
  }
  const metadata = fixture.metadata;
  const cover = await media(metadata.image.src);
  let content = fixture.content;
  for (const source of new Set(
    Array.from(content.matchAll(/\bsrc="([^"]+)"/g), (match) => match[1]),
  )) {
    const id = await media(source);
    content = content.replaceAll(
      `src="${source}"`,
      `src="${cmsUrl}/assets/${id}"`,
    );
  }
  await api("/items/blog_posts", {
    method: "POST",
    data: {
      slug: fixture.slug,
      status: "published",
      title: metadata.title,
      description: metadata.description,
      author: metadata.author,
      content,
      publication_date: new Date(metadata.publicationDate).toISOString(),
      last_updated: metadata.lastUpdated
        ? new Date(metadata.lastUpdated).toISOString()
        : null,
      cover_image: cover,
      image_alt: metadata.image.alt,
      tags: metadata.tags ?? [],
      faqs: metadata.faqs ?? [],
      cta_headline: metadata.ctaHeadline ?? null,
    },
  });
  console.log(`Migrated post and media: ${fixture.slug}`);
}
