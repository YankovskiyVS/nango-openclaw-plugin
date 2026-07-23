# nango-openclaw-plugin

OpenClaw plugin that exposes tools for each Nango provider and calls [ai-assistant-nango-proxy](../ai-assistant-nango-proxy).

## Adding / updating providers (YAML)

Source of truth: [`catalog/providers.yaml`](catalog/providers.yaml).

```bash
# edit YAML, then regenerate catalog + openclaw.plugin.json
npm run generate
```

Each entry becomes tools in `contracts.tools`.

- Default `kind: proxy` → one tool `nango_<key>_call` via `/proxy/…`
- `kind: mail` → `list`/`get`/`send` via `/mail/…`
- `kind: disk` → Disk CRUD + `upload` via Disk REST through `/proxy/yandex-disk/…`
- `kind: calendar` → CalDAV CRUD via `/calendar/…`

Do **not** hand-edit `src/catalog.generated.ts` or `contracts.tools` in `openclaw.plugin.json`.

## Behaviour

- **All catalog tools are registered and enabled at startup** (no `optional`, no config flips on connect).
- Operator keeps `plugins.entries.nango-proxy` static (`enabled: true`, empty config) — **no `connectionId` / providers in openclaw.json**.
- At call time nango-proxy resolves the OAuth connection; if missing → **404**.
- `nango_list_connections` calls `GET …/connections` on nango-proxy (manager/Nango state).

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
