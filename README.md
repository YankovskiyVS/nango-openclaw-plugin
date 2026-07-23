# nango-openclaw-plugin

OpenClaw plugin that exposes one tool per connected Nango provider (`nango_<provider>_call`) and calls [ai-assistant-nango-proxy](../ai-assistant-nango-proxy).

## Adding / updating providers (YAML)

Source of truth: [`catalog/providers.yaml`](catalog/providers.yaml).

```bash
# edit YAML, then regenerate catalog + openclaw.plugin.json
npm run generate
```

Each entry becomes:

- a tool `nango_<key_with_underscores>_call`
- an enum value in `config.providers[].type`
- a rich tool description with **upstream base URL** and example endpoints (same info as `openclaw-nango-skill`)

Do **not** hand-edit `src/catalog.generated.ts` or `contracts.tools` in `openclaw.plugin.json`.

## How URLs work

There is **one** proxy URL pattern for every provider:

```text
{NANGO_PROXY_URL}/api/v1/{projectId}/evo-claws/{evoclawId}/proxy/{provider_config_key}/{endpoint}
```

Per-provider “base URL” is the **upstream** host that Nango resolves (e.g. `https://login.yandex.ru`). The agent only passes `{endpoint}` relative to that base — same as skills’ `Upstream base (via Nango)`.

Example for Yandex ID:

| Layer | Value |
| --- | --- |
| Upstream base | `https://login.yandex.ru` |
| Agent `endpoint` | `info` (+ `query=format=json`) |
| Full proxy call | `…/proxy/yandex-id/info?format=json` |

Bitrix/amo use tenant hosts (`https://{domain}/rest`, `https://{subdomain}.amocrm.ru`) — Nango fills the tenant from the connection.

## Behaviour

- `contracts.tools` = generated superset from YAML.
- `register()` enables only providers in `plugins.entries.nango-proxy.config.providers`.
- Changing that config hot-reloads tools (no Gateway restart).
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
