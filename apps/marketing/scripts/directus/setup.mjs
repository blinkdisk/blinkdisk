import { randomBytes } from "node:crypto";
import { api, cmsUrl, find, local, query, saveLocal } from "./client.mjs";
import {
  previewLinkKey,
  serializeEnvironment,
  setupPreviewSecret,
} from "./config.mjs";

const collections = await api("/collections");
const secret = setupPreviewSecret(
  process.env.BLOG_PREVIEW_SECRET,
  local.BLOG_PREVIEW_SECRET,
  collections.find((entry) => entry.collection === "blog_posts")?.meta
    ?.preview_url,
);
serializeEnvironment({ BLOG_PREVIEW_SECRET: secret });
const websiteUrl = process.env.MARKETING_URL ?? "https://blinkdisk.com";
const folder =
  (await find("folders", { name: { _eq: "Blog" }, parent: { _null: true } })) ??
  (await api("/folders", { method: "POST", data: { name: "Blog" } }));
const choices = ["draft", "published", "archived"].map((value) => ({
  text: value[0].toUpperCase() + value.slice(1),
  value,
}));
function field(field, type, meta = {}, schema = {}) {
  return {
    field,
    type,
    meta: { interface: "input", width: "full", ...meta },
    schema: { is_nullable: true, ...schema },
  };
}
const editable = [
  "slug",
  "status",
  "title",
  "description",
  "author",
  "content",
  "publication_date",
  "last_updated",
  "cover_image",
  "image_alt",
  "tags",
  "faqs",
  "cta_headline",
];
const fields = [
  field(
    "id",
    "uuid",
    { hidden: true, readonly: true, special: ["uuid"] },
    { is_primary_key: true, is_nullable: false },
  ),
  field(
    "status",
    "string",
    { interface: "select-dropdown", options: { choices }, width: "half" },
    { default_value: "draft", is_nullable: false },
  ),
  field(
    "slug",
    "string",
    {
      required: true,
      options: { slug: true },
      width: "half",
      note: "Keep published URLs stable. Use lowercase words separated by hyphens.",
    },
    { is_unique: true, is_nullable: false },
  ),
  field("title", "string", { required: true }, { is_nullable: false }),
  field(
    "description",
    "text",
    {
      interface: "input-multiline",
      required: true,
      note: "Used for the listing, search results, and social previews.",
    },
    { is_nullable: false },
  ),
  field(
    "author",
    "string",
    { required: true, width: "half" },
    { default_value: "Paul Koeck", is_nullable: false },
  ),
  field(
    "publication_date",
    "timestamp",
    {
      interface: "datetime",
      required: true,
      width: "half",
      note: "Published posts with a future date remain hidden until that time.",
    },
    { is_nullable: false },
  ),
  field("last_updated", "timestamp", {
    interface: "datetime",
    width: "half",
    note: "Optional editorial date; otherwise the last save date is used.",
  }),
  field(
    "cover_image",
    "uuid",
    {
      interface: "file-image",
      special: ["file"],
      required: true,
      options: { folder: folder.id },
    },
    { is_nullable: false },
  ),
  field("image_alt", "string", { required: true }, { is_nullable: false }),
  field(
    "content",
    "text",
    {
      interface: "input-code",
      required: true,
      options: { language: "markdown", lineNumber: true, lineWrapping: true },
      note: "Markdown + Summary, Callout, Image, BlogFaq, Checklist and ChecklistItem tags. Literal attributes only; no imports or JavaScript. Use the private preview link to check saved edits.",
    },
    { is_nullable: false },
  ),
  field("tags", "json", { interface: "tags", special: ["cast-json"] }),
  field("faqs", "json", {
    interface: "list",
    special: ["cast-json"],
    options: {
      template: "{{ question }}",
      fields: [
        field("question", "string", { required: true }),
        field("answer", "text", {
          interface: "input-multiline",
          required: true,
        }),
      ],
    },
  }),
  field("cta_headline", "string", {
    note: "Optional headline for the download call to action.",
  }),
  field("date_created", "timestamp", {
    special: ["date-created"],
    interface: "datetime",
    readonly: true,
    hidden: true,
  }),
  field("date_updated", "timestamp", {
    special: ["date-updated"],
    interface: "datetime",
    readonly: true,
    hidden: true,
  }),
];
const meta = {
  icon: "article",
  note: "Runtime blog content. See the repository's Directus authoring guide.",
  display_template: "{{title}}",
  sort_field: null,
  archive_field: "status",
  archive_value: "archived",
  unarchive_value: "draft",
  versioning: true,
  preview_url: `${websiteUrl}/blog/preview/{{id}}?key=${previewLinkKey(secret)}`,
};
if (!collections.some((entry) => entry.collection === "blog_posts")) {
  await api("/collections", {
    method: "POST",
    data: { collection: "blog_posts", meta, schema: {}, fields },
  });
} else {
  const existing = await api("/fields/blog_posts");
  for (const definition of fields)
    if (!existing.some((entry) => entry.field === definition.field))
      await api("/fields/blog_posts", { method: "POST", data: definition });
  await api("/collections/blog_posts", { method: "PATCH", data: { meta } });
}
if (
  !(await api("/relations/blog_posts")).some(
    (relation) => relation.field === "cover_image",
  )
) {
  await api("/relations", {
    method: "POST",
    data: {
      collection: "blog_posts",
      field: "cover_image",
      related_collection: "directus_files",
      schema: { on_delete: "RESTRICT" },
    },
  });
}
async function policy(name, appAccess = false) {
  return (
    (await find("policies", { name: { _eq: name } })) ??
    (await api("/policies", {
      method: "POST",
      data: {
        name,
        icon: "article",
        admin_access: false,
        app_access: appAccess,
      },
    }))
  );
}
async function permission(
  policy,
  collection,
  action,
  fields,
  permissions = {},
  validation = {},
  presets = null,
) {
  const data = {
    policy: policy.id,
    collection,
    action,
    fields,
    permissions,
    validation,
    presets,
  };
  const existing = await find("permissions", {
    policy: { _eq: policy.id },
    collection: { _eq: collection },
    action: { _eq: action },
  });
  await api(existing ? `/permissions/${existing.id}` : "/permissions", {
    method: existing ? "PATCH" : "POST",
    data,
  });
}
const reader = await policy("Blog Website Reader");
const agent = await policy("Blog Marketing Agent", true);
let publicPolicy = await find("policies", { name: { _eq: "Public" } });
if (!publicPolicy) {
  publicPolicy = await policy("Blog Public Media");
  if (
    !(await find("access", {
      policy: { _eq: publicPolicy.id },
      role: { _null: true },
      user: { _null: true },
    }))
  )
    await api("/access", {
      method: "POST",
      data: { policy: publicPolicy.id, role: null, user: null },
    });
}
const folderFilter = { folder: { _eq: folder.id } };
for (const account of [reader, agent]) {
  await permission(account, "blog_posts", "read", ["*"]);
  await permission(account, "directus_files", "read", ["*"], folderFilter);
  await permission(
    account,
    "directus_folders",
    "read",
    ["id", "name", "parent"],
    { id: { _eq: folder.id } },
  );
  await permission(account, "directus_versions", "read", ["*"], {
    collection: { _eq: "blog_posts" },
  });
  await permission(account, "directus_revisions", "read", ["*"], {
    collection: { _eq: "blog_posts" },
  });
}
const validation = {
  _and: [
    { status: { _in: ["draft", "published", "archived"] } },
    { slug: { _regex: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
    { cover_image: { _nnull: true } },
  ],
};
for (const action of ["create", "update"])
  await permission(
    agent,
    "blog_posts",
    action,
    editable,
    {},
    validation,
    action === "create" ? { status: "draft" } : null,
  );
const mediaFields = [
  "title",
  "description",
  "folder",
  "filename_download",
  "tags",
  "focal_point_x",
  "focal_point_y",
];
for (const action of ["create", "update"])
  await permission(
    agent,
    "directus_files",
    action,
    action === "create" ? [...mediaFields, "storage", "type"] : mediaFields,
    action === "update" ? folderFilter : {},
    action === "create"
      ? {
          _and: [
            folderFilter,
            {
              type: {
                _in: [
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "image/gif",
                  "image/avif",
                ],
              },
            },
          ],
        }
      : folderFilter,
    action === "create" ? { folder: folder.id } : null,
  );
for (const action of ["create", "update"])
  await permission(
    agent,
    "directus_versions",
    action,
    ["key", "name", "collection", "item", "delta", "hash"],
    action === "update" ? { collection: { _eq: "blog_posts" } } : {},
    { collection: { _eq: "blog_posts" } },
  );
await permission(
  publicPolicy,
  "directus_files",
  "read",
  [
    "id",
    "title",
    "description",
    "filename_download",
    "type",
    "width",
    "height",
    "filesize",
    "modified_on",
    "uploaded_on",
    "storage",
    "filename_disk",
  ],
  folderFilter,
);
async function user(email, name, userPolicy, tokenName) {
  let account = await find("users", { email: { _eq: email } });
  let token = local[tokenName];
  if (account && token) {
    const response = await fetch(new URL("/users/me?fields=id", cmsUrl), {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "BlinkDisk-CMS-Setup/1.0",
      },
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok || (await response.json()).data?.id !== account.id)
      token = undefined;
  }
  const needsToken = !token;
  token ??= randomBytes(32).toString("hex");
  if (!account) {
    account = await api("/users", {
      method: "POST",
      data: {
        email,
        first_name: name,
        status: "active",
        token,
        policies: [{ policy: userPolicy.id }],
      },
    });
  } else {
    const access = await api(
      `/access?${query({ filter: { user: { _eq: account.id }, policy: { _eq: userPolicy.id } } })}`,
    );
    if (!access.length)
      await api("/access", {
        method: "POST",
        data: { user: account.id, policy: userPolicy.id },
      });
    if (needsToken)
      await api(`/users/${account.id}`, { method: "PATCH", data: { token } });
  }
  return token;
}
const websiteToken = await user(
  "blog-website-service@blinkdisk.com",
  "Blog Website",
  reader,
  "DIRECTUS_TOKEN",
);
const agentToken = await user(
  "blog-agent-service@blinkdisk.com",
  "Blog Agent",
  agent,
  "DIRECTUS_AGENT_TOKEN",
);
saveLocal({
  DIRECTUS_URL: cmsUrl,
  DIRECTUS_TOKEN: websiteToken,
  BLOG_PREVIEW_SECRET: secret,
  DIRECTUS_AGENT_TOKEN: agentToken,
  DIRECTUS_BLOG_FOLDER: folder.id,
});
if (
  !(await find("presets", {
    collection: { _eq: "blog_posts" },
    user: { _null: true },
    role: { _null: true },
  }))
)
  await api("/presets", {
    method: "POST",
    data: {
      collection: "blog_posts",
      layout: "tabular",
      layout_query: {
        tabular: {
          fields: ["title", "status", "publication_date", "author"],
          sort: ["-publication_date"],
        },
      },
    },
  });
console.log(
  "Directus blog schema, permissions, and service accounts configured. Credentials saved only to apps/marketing/.env.local.",
);
