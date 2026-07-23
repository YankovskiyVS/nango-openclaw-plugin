/**
 * nango-openclaw-plugin — OpenClaw tools for ai-assistant-nango-proxy.
 *
 * Registers one tool per active provider in plugins.entries.nango-proxy.config.providers.
 * Hot-reload of that config re-runs register() without restarting the Gateway.
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import {
  CATALOG_BY_KEY,
  CATALOG_BY_TOOL,
  LIST_CONNECTIONS_TOOL,
  buildToolDescription,
  type ProviderMeta,
} from "./catalog.js";
import {
  type PluginConfig,
  type ProviderConfig,
  providerKey,
  resolveRuntime,
} from "./config.js";
import { isConnectionAlive, proxyCall } from "./proxy.js";

const PLUGIN_ID = "nango-proxy";
const PLUGIN_VERSION = "0.2.0";

function callParameters(meta: ProviderMeta) {
  const example =
    meta.examples?.[0]?.endpoint ||
    "path/relative/to/upstreamBase";
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      method: {
        type: "string",
        description: "HTTP method (GET, POST, PUT, PATCH, DELETE, …)",
        default: "GET",
      },
      endpoint: {
        type: "string",
        description:
          `Path relative to upstream base ${meta.upstreamBase || "(see catalog)"}. ` +
          `Example: ${example}. Do not include the upstream host.`,
      },
      query: {
        type: "string",
        description: "Optional raw query string without leading ?",
      },
      data: {
        description: "Optional JSON body for non-GET requests",
      },
    },
    required: ["endpoint"],
  } as const;
}

function toolResult(payload: unknown): {
  content: Array<{ type: "text"; text: string }>;
} {
  const text =
    typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  return { content: [{ type: "text", text }] };
}

function registerProviderTool(
  api: OpenClawPluginApi,
  runtime: ReturnType<typeof resolveRuntime>,
  provider: ProviderConfig,
  meta: ProviderMeta,
): void {
  const key = providerKey(provider);
  const label = provider.displayName || meta.displayName || key;

  api.registerTool({
    name: meta.tool,
    description: buildToolDescription(meta, label),
    parameters: callParameters(meta),
    async execute(
      _id: string,
      params: {
        method?: string;
        endpoint?: string;
        query?: string;
        data?: unknown;
      },
    ) {
      const endpoint = (params.endpoint || "").trim();
      if (!endpoint) {
        return toolResult({ error: "endpoint is required" });
      }
      const res = await proxyCall({
        proxyBaseUrl: runtime.proxyBaseUrl,
        projectId: runtime.projectId,
        evoclawId: runtime.evoclawId,
        apiKey: runtime.apiKey,
        providerConfigKey: key,
        method: params.method || "GET",
        endpoint,
        query: params.query,
        body: params.data,
      });
      return toolResult({
        status: res.status,
        body: tryParseJSON(res.bodyText),
      });
    },
  });
}

function tryParseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default {
  id: PLUGIN_ID,
  name: "Nango Proxy Connector",
  version: PLUGIN_VERSION,
  description:
    "Tools for 3rd-party providers via ai-assistant-nango-proxy (self-hosted Nango)",

  register(api: OpenClawPluginApi) {
    const cfg = ((api as { pluginConfig?: PluginConfig }).pluginConfig ??
      {}) as PluginConfig;

    let runtime: ReturnType<typeof resolveRuntime>;
    try {
      runtime = resolveRuntime(cfg);
    } catch (err) {
      api.logger.error(
        `[nango-proxy] failed to resolve runtime: ${err instanceof Error ? err.message : String(err)}`,
      );
      return;
    }

    const active = runtime.providers;
    const registered: string[] = [];

    for (const p of active) {
      const key = providerKey(p);
      if (!key || !p.connectionId) {
        api.logger.warn(
          `[nango-proxy] skip provider with missing type/connectionId: ${JSON.stringify(p)}`,
        );
        continue;
      }
      const meta = CATALOG_BY_KEY.get(key);
      if (!meta) {
        api.logger.warn(`[nango-proxy] unknown provider type (not in catalog): ${key}`);
        continue;
      }
      registerProviderTool(api, runtime, p, meta);
      registered.push(meta.tool);
    }

    api.registerTool({
      name: LIST_CONNECTIONS_TOOL,
      description:
        "List active 3rd-party provider connections available to this EvoClaw instance.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      async execute() {
        return toolResult(
          active.map((p) => {
            const key = providerKey(p);
            const meta = CATALOG_BY_KEY.get(key);
            return {
              type: key,
              connectionId: p.connectionId,
              displayName: p.displayName || meta?.displayName || key,
              tool: meta?.tool,
              upstreamBase: meta?.upstreamBase,
              examples: meta?.examples,
              enabled: p.enabled !== false,
            };
          }),
        );
      },
    });

    api.on("before_tool_call", async (event: { toolName?: string; name?: string }) => {
      const toolName = event.toolName || event.name || "";
      if (toolName === LIST_CONNECTIONS_TOOL) {
        return { block: false };
      }
      const meta = CATALOG_BY_TOOL.get(toolName);
      if (!meta) {
        return { block: false };
      }
      const p = active.find((x) => providerKey(x) === meta.key);
      if (!p) {
        return {
          block: true,
          reason: `Connection for ${meta.key} is not enabled — tool temporarily blocked.`,
        };
      }
      const alive = await isConnectionAlive({
        proxyBaseUrl: runtime.proxyBaseUrl,
        projectId: runtime.projectId,
        evoclawId: runtime.evoclawId,
        apiKey: runtime.apiKey,
        providerConfigKey: meta.key,
      });
      if (!alive) {
        return {
          block: true,
          reason: `Connection for ${meta.key} is disconnected or unavailable — tool temporarily blocked.`,
        };
      }
      return { block: false };
    });

    api.logger.info(
      `[nango-proxy] v${PLUGIN_VERSION} registered tools: ${[...registered, LIST_CONNECTIONS_TOOL].join(", ") || "(none)"}`,
    );
  },
};
