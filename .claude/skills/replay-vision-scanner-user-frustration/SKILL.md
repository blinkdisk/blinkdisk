---
name: replay-vision-scanner-user-frustration
description: The frustration monitor brief for Replay vision
metadata:
  author: PostHog
  version: 1.54.1
---

# Frustration scanner (monitor)

The user getting stuck, described in **this** product's terms. Gated on
`$rageclick` — cheap and high-precision, because here the gating event *is*
the friction. Create with `vision-scanners-create`. You fill three blanks;
the scaffold around them is locked, and so is the query: **leave the
`$rageclick` gate as the only filter** — this monitor owns the *what they
did* axis of the disjointness rule in `replay-vision-scanners-core`.

```jsonc
{
  // AGENT FILLS `name`, per the core naming rule - "Booking frustration",
  // "Editor rage clicks".
  "name": "<name>",
  "scanner_type": "monitor",
  "scanner_config": {
    "prompt": "Watch this session for clear signs the user got stuck or frustrated: repeatedly clicking the same element, hammering a button that isn't responding, retrying the same action over and over, visibly hunting for something they can't find, or abandoning a flow partway through. In this product that especially means: {{STUCK_MOMENTS}}. Only flag genuine struggle you can see – not normal browsing or a single mis-click. For each: what they were trying to do, where they got stuck, and the URL.\n\n{{PRODUCT_CONTEXT}}"
  },
  "query": {
    "kind": "RecordingsQuery",
    "events": [{ "id": "$rageclick", "type": "events" }]
  },
  "sampling_rate": 1.0,
  "model": "gemini-3-flash-preview"
}
```

**`{{STUCK_MOMENTS}}`** is three to six places a user of *this* product
realistically gets stuck, read out of the repo — "hammering a slot that is
already booked", "retrying the invite form after a silent validation error".
On-screen facts in the product's vocabulary, under the same content rules as
`{{PRODUCT_CONTEXT}}`.

Re-run match phrase: `clear signs the user got stuck or frustrated`.
