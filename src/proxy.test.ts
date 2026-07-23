import assert from "node:assert/strict";
import { test } from "node:test";
import { buildMailUrl, buildUrl } from "./proxy.ts";

test("buildUrl joins proxy path", () => {
  const url = buildUrl(
    "http://proxy:8080",
    "proj",
    "evo",
    "yandex-id",
    "/info",
  );
  assert.equal(
    url,
    "http://proxy:8080/api/v1/proj/evo-claws/evo/proxy/yandex-id/info",
  );
});

test("buildUrl appends query", () => {
  const url = buildUrl(
    "http://proxy:8080/",
    "proj",
    "evo",
    "bitrix24-crm",
    "crm.deal.list.json",
    "start=0",
  );
  assert.equal(
    url,
    "http://proxy:8080/api/v1/proj/evo-claws/evo/proxy/bitrix24-crm/crm.deal.list.json?start=0",
  );
});

test("buildMailUrl list/get/send", () => {
  assert.equal(
    buildMailUrl("http://proxy", "p", "e", "list", "limit=20"),
    "http://proxy/api/v1/p/evo-claws/e/mail/list?limit=20",
  );
  assert.equal(
    buildMailUrl("http://proxy", "p", "e", "get", "uid=1"),
    "http://proxy/api/v1/p/evo-claws/e/mail/get?uid=1",
  );
  assert.equal(
    buildMailUrl("http://proxy", "p", "e", "send"),
    "http://proxy/api/v1/p/evo-claws/e/mail/send",
  );
});
