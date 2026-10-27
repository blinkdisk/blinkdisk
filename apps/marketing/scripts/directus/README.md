# Directus blog

Directus is the source of truth for blog posts and images. The website renders them on Cloudflare at request time; publishing requires no code commit, build, or deployment. Glossary and security articles still use local MDX.

## Setup and migration

From `apps/marketing`, provide `DIRECTUS_URL` (an origin URL without a path prefix) and `DIRECTUS_ADMIN_TOKEN` in the shell, then run:

```sh
pnpm cms:setup
pnpm cms:migrate
```

Setup creates the `blog_posts` schema, Blog media folder, scoped policies, service accounts, and private preview URL. It saves the website token, marketing-agent token, folder ID, and preview secret to the ignored `apps/marketing/.env.local` file with private filesystem permissions. Keep that file private. The scripts never print credentials. The admin token is used only for setup and migration, not by the website.

Setup preserves existing account tokens. Migration deduplicates images by SHA-256 and skips existing post slugs entirely, preserving any edits made in Directus. The two JSON fixtures are historical migration inputs, not a website fallback or a place to add future articles. Their local screenshot remains in the repository because other site content may use it.

The website requires `DIRECTUS_URL`, `DIRECTUS_TOKEN` (the read-only website account), and `BLOG_PREVIEW_SECRET`. Setup also writes the three website bindings to the ignored `.dev.vars` file for the local Cloudflare runtime. Restart local dev/preview after changing credentials. Cloudflare production reads these from runtime bindings. Configure these three runtime values directly on the Cloudflare `marketing` Worker before deploying this change. Use `https://cms.blinkdisk.com` for `DIRECTUS_URL`; copy `DIRECTUS_TOKEN` and `BLOG_PREVIEW_SECRET` from the private, ignored `apps/marketing/.env.local` file. The preview secret must match the one used by setup to configure the Directus preview link. These values are not GitHub Actions secrets; the deployment workflow does not provision or update them. Builds and PR checks need no CMS credentials or network connection.

The separate `DIRECTUS_AGENT_TOKEN` from `.env.local` can authenticate the marketing agent to `https://cms.blinkdisk.com/mcp` using an `Authorization: Bearer ...` header. It is not a website runtime secret. Never use the setup administrator token for the daily agent.

## Posts and publishing

Required fields are `slug`, `title`, `description`, `author`, `content`, `cover_image`, `image_alt`, and `publication_date`. Dates are timestamps stored in UTC; use an explicit offset when writing through the API. Optional fields are `last_updated`, `tags` (string array), `faqs` (question/answer array), and `cta_headline`.

- `draft`: only available in private preview.
- `published`, publication date in the past: public.
- `published`, publication date in the future: scheduled; becomes public when that time arrives, subject to the five-minute cache.
- `archived`: hidden from the public website and sitemap.

Keep published slugs stable: changing one changes its URL; automatic redirects are not implemented. Saving the main version of a published post changes the live page after cache expiry. To prepare changes privately, use Directus content versions and promote a version when ready. The preview supports a `version` query parameter containing a Directus version key; without it, it shows the saved main item.

Click/open the preview URL from Directus in a separate tab. It exchanges a dedicated, derived preview key for a one-hour HTTP-only session, then removes the key from the URL. Refresh after saving. Previews are not cached, are marked noindex, and do not load site analytics or chat integrations. The link key is derived from the server secret with a separate HMAC context; it does not reveal the session-signing secret. The preview key grants access to saved drafts, so treat preview links as private. Setup refuses to replace an existing preview configuration if the current secret is unavailable. Empty environment values fall back to the stored secret. Secrets must not contain quotes, backslashes, or control characters. Rotating the preview secret requires updating the Directus preview URL and the website secret together.

## Content syntax

GFM footnotes are not supported; use ordinary links or a references section. Use Markdown with GFM tables, fenced code blocks, links, and self-closing image tags. Components are available without imports:

```md
<Summary>
A **short summary** of the article.
</Summary>

<Callout variant="warning" title="Important">
Text, [links](/download), and Markdown formatting.
</Callout>

<Image src="https://cms.blinkdisk.com/assets/FILE_UUID" alt="Describe the image" width="1200" height="675" />

<Checklist title="Before you start">
<ChecklistItem>
<strong>Choose your backup folder</strong><br />
Check that it contains the files you want to protect.
</ChecklistItem>
</Checklist>

<BlogFaq />
```

`Callout` supports `warning` (default) and `info`. `BlogFaq` renders the post's FAQ metadata. Checklist items use native accessible checkboxes and keep their state for the current page visit. Use `mermaid` fenced blocks for diagrams; ordinary code fences support Bash, JavaScript, TypeScript, and JSON highlighting, with plain-text fallback for other languages.

Ordinary HTML is supported for text, links, layout, figures, tables, and disclosure elements. Use JSX-compatible markup: close tags and write void elements as `<br />` or `<img ... />`. Attributes must be literal strings or booleans: `width="1200"`, never `width={1200}`. `className` is accepted as an alias for `class`.

Inline styles support colors, borders, spacing, sizing, display, flex/grid, typography, overflow, and shadows. CSS URLs, escapes, imports, comments, and executable expressions are rejected. Existing site classes can be used; new Tailwind utilities are not generated from CMS text. Prefer the predefined components or inline styles for new layouts.

Imports, exports, JavaScript expressions, spread attributes, scripts, iframes, event handlers, unknown components, and unsafe URL schemes are rejected. Literal braces in prose need escaping or code formatting. Preview reports content errors with source line numbers where available. Article content is limited to 500,000 characters.

## Media and access

Upload JPEG, PNG, WebP, GIF, or AVIF images into the Blog folder using the agent token and the `folder` ID from `.env.local`. Reference `/assets/FILE_UUID` URLs (resolved against Directus) in the content, and use a file UUID for `cover_image`. Add meaningful alt text. Inline images preserve their natural aspect ratio when dimensions are omitted; dimensions may also be provided explicitly. Public image access is limited to this folder, including files used by drafts; article bodies and drafts remain private. Do not upload confidential images into this public folder.

The website account can read blog posts, their versions, and blog files. It cannot write. The marketing-agent account can create/edit posts and blog files, publish/schedule/archive posts, and prepare content versions. It cannot delete records, manage users, or change the schema. The existing administrator account is unchanged.

## Caching, failures, and rollback

Published listings, sitemap data, and validated articles use a five-minute edge cache. Cached data may remain available for up to one hour during transient CMS failures. This is best effort and local to the serving Cloudflare cache; cold or evicted caches return HTTP 503. A successful CMS response indicating a post is no longer public evicts its cached article; it is never replaced with stale content after that response. Authorization failures do not use stale content.

Private preview always reads Directus directly. Unknown, draft, future, and archived public URLs return HTTP 404; CMS failures without a usable cache return HTTP 503, not an empty archive or a false 404. Existing static pages continue to work independently of the CMS.

The PR does not deploy the marketing website. After review, deploy through the existing marketing workflow. Until then, production still serves its original static posts. Reverting the website change restores that behavior; leave the migrated CMS content intact. Neither script deletes existing CMS records or source media.
