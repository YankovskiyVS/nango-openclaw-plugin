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
  const tools = CATALOG.flatMap((p) => p.tools.map((t) => t.name));
  assert.equal(new Set(tools).size, tools.length);
  for (const p of CATALOG) {
    assert.ok(p.upstreamBase, `${p.key} must have upstreamBase`);
    assert.ok(p.tools?.length, `${p.key} must have tools`);
    if (p.kind === "mail" || p.kind === "disk" || p.kind === "calendar") {
      for (const t of p.tools) {
        assert.equal(t.name, `nango_${p.key.replace(/-/g, "_")}_${t.action}`);
        assert.equal(CATALOG_BY_TOOL.get(t.name)?.key, p.key);
      }
    } else {
      assert.equal(p.tool, `nango_${p.key.replace(/-/g, "_")}_call`);
      assert.equal(CATALOG_BY_KEY.get(p.key)?.tool, p.tool);
      assert.equal(CATALOG_BY_TOOL.get(p.tool)?.key, p.key);
      assert.ok(p.examples?.length, `${p.key} must have at least one example`);
    }
  }
});

test("yandex-mail exposes list/get/send tools", () => {
  const meta = CATALOG_BY_KEY.get("yandex-mail");
  assert.ok(meta);
  assert.equal(meta.kind, "mail");
  assert.deepEqual(
    meta.tools.map((t) => t.action),
    ["list", "get", "send"],
  );
});

test("yandex-disk and yandex-calendar expose CRUD tools", () => {
  const disk = CATALOG_BY_KEY.get("yandex-disk");
  assert.ok(disk);
  assert.equal(disk.kind, "disk");
  assert.ok(disk.tools.some((t) => t.action === "mkdir"));
  assert.ok(disk.tools.some((t) => t.action === "delete"));
  assert.ok(disk.tools.some((t) => t.action === "upload"));
  assert.ok(CATALOG_BY_TOOL.has("nango_yandex_disk_upload_link"));
  assert.ok(CATALOG_BY_TOOL.has("nango_yandex_disk_upload"));

  const cal = CATALOG_BY_KEY.get("yandex-calendar");
  assert.ok(cal);
  assert.equal(cal.kind, "calendar");
  assert.deepEqual(
    cal.tools.map((t) => t.action),
    ["list_calendars", "list_events", "get_event", "create_event", "update_event", "delete_event"],
  );
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

test("allContractTools includes list helper and mail tools", () => {
  const tools = allContractTools();
  assert.ok(tools.includes(LIST_CONNECTIONS_TOOL));
  assert.ok(tools.includes("nango_yandex_mail_list"));
  assert.ok(!tools.includes("nango_yandex_mail_call"));
  const expected =
    CATALOG.reduce((n, p) => n + p.tools.length, 0) + 1;
  assert.equal(tools.length, expected);
});
