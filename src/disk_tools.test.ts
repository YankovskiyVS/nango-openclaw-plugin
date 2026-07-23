import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeDiskPath } from "./disk_tools.ts";

test("normalizeDiskPath adds leading slash and strips disk:", () => {
  assert.equal(normalizeDiskPath("Тезисы Highload++.pdf"), "/Тезисы Highload++.pdf");
  assert.equal(normalizeDiskPath("/already/ok"), "/already/ok");
  assert.equal(normalizeDiskPath("disk:/folder/a.pdf"), "/folder/a.pdf");
  assert.equal(normalizeDiskPath("disk:folder/a.pdf"), "/folder/a.pdf");
  assert.equal(normalizeDiskPath("", "/"), "/");
  assert.equal(normalizeDiskPath(undefined, "/"), "/");
});
