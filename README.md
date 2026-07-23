# nango-openclaw-plugin

OpenClaw plugin that exposes one tool per connected Nango provider (`nango_<provider>_call`) and calls [ai-assistant-nango-proxy](../ai-assistant-nango-proxy).

## Adding / updating providers (YAML)

Source of truth: [`catalog/providers.yaml`](catalog/providers.yaml).

```bash
# edit YAML, then regenerate catalog + openclaw.plugin.json
npm run generate
```

Each entry becomes tools in `contracts.tools` + enum in `config.providers[].type`.

- Default `kind: proxy` → one tool `nango_<key>_call` via `/proxy/…`
- `kind: mail` → `list`/`get`/`send` via `/mail/…`
- `kind: disk` → full Disk CRUD tools via Disk REST through `/proxy/yandex-disk/…`
- `kind: calendar` → CalDAV CRUD via `/calendar/…`

Connecting **yandex-disk** / **yandex-calendar** / **yandex-mail** enables all tools of that kind at once.

Do **not** hand-edit `src/catalog.generated.ts` or `contracts.tools` in `openclaw.plugin.json`.

## How URLs work

**REST providers** — one proxy pattern:

```text
{NANGO_PROXY_URL}/api/v1/{projectId}/evo-claws/{evoclawId}/proxy/{provider_config_key}/{endpoint}
```

Per-provider “base URL” is the **upstream** host that Nango resolves (e.g. `https://login.yandex.ru`).

**Yandex Mail** (`kind: mail`) — dedicated routes (IMAP/SMTP inside the proxy):

```text
GET  …/mail/list?mailbox=INBOX&limit=20
GET  …/mail/get?uid=123
POST …/mail/send
```

Tools on connect: `nango_yandex_mail_list`, `nango_yandex_mail_get`, `nango_yandex_mail_send`.

Bitrix/amo use tenant hosts (`https://{domain}/rest`, `https://{subdomain}.amocrm.ru`) — Nango fills the tenant from the connection.

## Behaviour

- Operator writes **full catalog** into `plugins.entries.nango-proxy.config.providers` with `enabled: false` and empty `connectionId`.
- On connect: flip that entry to `enabled: true` + real `connectionId` (no add/remove of list members).
- `register()` activates tools only for `enabled && connectionId`.
- Config lives on a **local emptyDir** (not S3 PVC) so Gateway fsnotify/hot-reload sees the flip.
- `before_tool_call` blocks calls when the connection is missing/unavailable.
- `nango_list_connections` returns `upstreamBase` + `examples` for active connections.

## Runtime env (injected by evoclaw-operator)

| Env | Purpose |
| --- | --- |
| `NANGO_PROXY_URL` | Proxy base URL |
| `EVOLUTION_PROJECT_ID` | Project UUID |
| `EVOCLAW_ID` | EvoClaw UUID |
| `CLOUDRU_API_KEY` | Api-Key for the proxy |

## Local install

```bash
npm install
npm run generate
openclaw plugins install --link .
openclaw plugins enable nango-proxy
```
