---
name: replay-vision-scanner-broken-experiences
description: The breakage monitor brief for Replay vision
metadata:
  author: PostHog
  version: 1.54.1
---

# Breakage scanner (monitor)

The product visibly breaking, on the flow where breaking costs the most —
written for **this** product, not a generic template. Create with
`vision-scanners-create`. You fill four blanks; the scaffold around them is
locked.

```jsonc
{
  // AGENT FILLS `name`, per the core naming rule - "Broken checkout",
  // "Booking failures".
  "name": "<name>",
  "scanner_type": "monitor",
  "scanner_config": {
    "prompt": "Watch this session for moments where the product visibly broke for the user: an error message or toast, a blank/white screen, content that failed to load, obviously broken layout, a spinner that never resolves, or a button/form/action that clearly did nothing or failed. In this product that especially means: {{WATCH_FOR}}. Only flag issues that are unambiguous on screen and would actually matter to the user – ignore cosmetic nits and anything you're unsure about. For each: what the user was trying to do, what broke, and the URL.\n\n{{PRODUCT_CONTEXT}}"
  },
  "query": {
    // AGENT FILLS: this product's key completion flow + its immediate
    // predecessors, read out of the repo.
    "kind": "RecordingsQuery",
    "properties": [
      { "key": "$current_url", "value": "/checkout", "operator": "icontains", "type": "event" }
    ]
  },
  "sampling_rate": 0.5,
  "model": "gemini-3-flash-preview"
}
```

**`{{WATCH_FOR}}`** is what makes this scanner belong to this product: three
to six concrete failure modes read out of the repo, each observable on screen,
in the product's own vocabulary — "the slot picker showing no available
courts", "the payment step rejecting a valid card", "a booking confirmation
that never appears". Facts about what failure looks
like *here*, under the same content rules as `{{PRODUCT_CONTEXT}}`.

This monitor owns the *where* axis of the disjointness rule in
`replay-vision-scanners-core` — a URL-scoped query, never an event gate. In
particular never gate it on `$exception`: that blinds it to silent breakage,
the thing vision is uniquely good at.

Re-run match phrase: `moments where the product visibly broke for the user`.
