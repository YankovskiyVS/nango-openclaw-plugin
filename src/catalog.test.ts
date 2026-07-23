import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CATALOG,
  CATALOG_BY_KEY,
  CATALOG_BY_TOOL,
  LIST_CONNECTIONS_TOOL,
  allContractTools,
  buildToolDescription,
} from "./catalog.ts";

test("catalog tools are unique and match naming convention", () => {
  const tools = CATALOG.map((p) => p.tool);
  assert.equal(new Set(tools).size, tools.length);
  for (const p of CATALOG) {
    assert.equal(p.tool, `nango_${p.key.replace(/-/g, "_")}_call`);
    assert.equal(CATALOG_BY_KEY.get(p.key)?.tool, p.tool);
    assert.equal(CATALOG_BY_TOOL.get(p.tool)?.key, p.key);
    assert.ok(p.upstreamBase, `${p.key} must have upstreamBase`);
    assert.ok(p.examples?.length, `${p.key} must have at least one example`);
  }
});

test("yandex alias resolves to yandex-id", () => {
  assert.equal(CATALOG_BY_KEY.get("yandex")?.key, "yandex-id");
});

test("tool description includes upstream and proxy shape", () => {
  const meta = CATALOG_BY_KEY.get("yandex-id");
  assert.ok(meta);
  const desc = buildToolDescription(meta);
  assert.match(desc, /login\.yandex\.ru/);
  assert.match(desc, /proxy\/yandex-id\//);
  assert.match(desc, /info/);
});

test("allContractTools includes list helper", () => {
  const tools = allContractTools();
  assert.ok(tools.includes(LIST_CONNECTIONS_TOOL));
  assert.equal(tools.length, CATALOG.length + 1);
});
