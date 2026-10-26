import assert from "node:assert/strict";
import { unstable_dev } from "wrangler";

const worker = await unstable_dev("dist/server/entry.mjs", {
  config: "dist/server/wrangler.json",
  local: true,
  persist: false,
  logLevel: "error",
  experimental: { disableExperimentalWarning: true, watch: false },
});

const headers = { "Sec-Fetch-Mode": "navigate" };

try {
  for (const [path, title] of [
    [
      "/compare",
      "Backup Software Comparison: Find the Best Tool for Your Needs",
    ],
    [
      "/compare/easeus-todo-backup-vs-idrive-vs-blinkdisk",
      "EaseUS Todo Backup vs IDrive vs BlinkDisk: A Detailed Comparison",
    ],
    [
      "/compare/idrive-vs-blinkdisk",
      "IDrive vs BlinkDisk: A Detailed Comparison",
    ],
    [
      "/compare/blinkdisk-vs-idrive",
      "BlinkDisk vs IDrive: A Detailed Comparison",
    ],
  ]) {
    const response = await worker.fetch(path, { headers });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<!doctype html>/i, path);
    assert.ok(html.includes(title), `${path}: missing comparison title`);
  }

  const alias = await worker.fetch("/compare/acronis-vs-blinkdisk", {
    headers,
    redirect: "manual",
  });
  assert.equal(alias.status, 301);
  assert.equal(
    alias.headers.get("location"),
    "/compare/acronis-true-image-vs-blinkdisk",
  );

  const invalid = await worker.fetch("/compare/unknown-tool-vs-blinkdisk", {
    headers,
    redirect: "manual",
  });
  assert.equal(invalid.status, 302);
  assert.equal(invalid.headers.get("location"), "/404");
  assert.equal(
    (await worker.fetch("/unknown-comparison-check", { headers })).status,
    404,
  );

  console.log("Comparison page checks passed.");
} finally {
  await worker.stop();
}
