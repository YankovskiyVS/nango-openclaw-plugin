/**
 * nango-openclaw-plugin — OpenClaw tools for ai-assistant-nango-proxy.
 *
 * Registers the full catalog of tools at startup (always enabled).
 * No per-connection config: nango-proxy resolves OAuth at call time and
 * returns 404 when the integration is not connected.
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import {
  CATALOG,
  CATALOG_BY_KEY,
  LIST_CONNECTIONS_TOOL,
  buildToolDescription,
  type ProviderMeta,
} from "./catalog.js";
import {
  type GetRuntime,
  type PluginConfig,
  resolveRuntime,
} from "./config.js";
import { listConnections, mailCall, proxyCall } from "./proxy.js";
import { registerCalendarTools } from "./calendar_tools.js";
import { registerDiskTools } from "./disk_tools.js";

const PLUGIN_ID = "nango-proxy";
const PLUGIN_VERSION = "0.5.0";

function readPluginConfig(api: OpenClawPluginApi): PluginConfig {
  return ((api as { pluginConfig?: PluginConfig }).pluginConfig ??
    {}) as PluginConfig;
}

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

function tryParseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function registerProxyTool(
  api: OpenClawPluginApi,
  getRuntime: GetRuntime,
  meta: ProviderMeta,
): string[] {
  const label = meta.displayName || meta.key;
  const tool = meta.tools[0]?.name || meta.tool;

  api.registerTool({
    name: tool,
    description: buildToolDescription(meta, label, tool),
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
      const runtime = getRuntime();
      const endpoint = (params.endpoint || "").trim();
      if (!endpoint) {
        return toolResult({ error: "endpoint is required" });
      }
      const res = await proxyCall({
        proxyBaseUrl: runtime.proxyBaseUrl,
        projectId: runtime.projectId,
        evoclawId: runtime.evoclawId,
        apiKey: runtime.apiKey,
        providerConfigKey: meta.key,
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
  return [tool];
}

function registerMailTools(
  api: OpenClawPluginApi,
  getRuntime: GetRuntime,
  meta: ProviderMeta,
): string[] {
  const label = meta.displayName || meta.key;
  const registered: string[] = [];

  for (const t of meta.tools) {
    const action = t.action as "list" | "get" | "send";
    if (action === "list") {
      api.registerTool({
        name: t.name,
        description: buildToolDescription(meta, label, t.name),
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            mailbox: {
              type: "string",
              description: "IMAP mailbox name (default INBOX)",
              default: "INBOX",
            },
            limit: {
              type: "number",
              description: "Max messages to return (default 20, max 100)",
              default: 20,
            },
          },
        },
        async execute(
          _id: string,
          params: { mailbox?: string; limit?: number },
        ) {
          const runtime = getRuntime();
          const q = new URLSearchParams();
          if (params.mailbox) q.set("mailbox", String(params.mailbox));
          if (params.limit != null) q.set("limit", String(params.limit));
          const res = await mailCall({
            proxyBaseUrl: runtime.proxyBaseUrl,
            projectId: runtime.projectId,
            evoclawId: runtime.evoclawId,
            apiKey: runtime.apiKey,
            action: "list",
            query: q.toString(),
          });
          return toolResult({
            status: res.status,
            body: tryParseJSON(res.bodyText),
          });
        },
      });
    } else if (action === "get") {
      api.registerTool({
        name: t.name,
        description: buildToolDescription(meta, label, t.name),
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            uid: {
              type: "number",
              description: "IMAP UID of the message",
            },
            mailbox: {
              type: "string",
              description: "IMAP mailbox name (default INBOX)",
              default: "INBOX",
            },
          },
          required: ["uid"],
        },
        async execute(
          _id: string,
          params: { uid?: number; mailbox?: string },
        ) {
          const runtime = getRuntime();
          if (params.uid == null) {
            return toolResult({ error: "uid is required" });
          }
          const q = new URLSearchParams({ uid: String(params.uid) });
          if (params.mailbox) q.set("mailbox", String(params.mailbox));
          const res = await mailCall({
            proxyBaseUrl: runtime.proxyBaseUrl,
            projectId: runtime.projectId,
            evoclawId: runtime.evoclawId,
            apiKey: runtime.apiKey,
            action: "get",
            query: q.toString(),
          });
          return toolResult({
            status: res.status,
            body: tryParseJSON(res.bodyText),
          });
        },
      });
    } else if (action === "send") {
      api.registerTool({
        name: t.name,
        description: buildToolDescription(meta, label, t.name),
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            to: {
              type: "array",
              items: { type: "string" },
              description: "Recipient email addresses",
            },
            cc: {
              type: "array",
              items: { type: "string" },
              description: "Optional CC addresses",
            },
            subject: { type: "string", description: "Email subject" },
            body: { type: "string", description: "Plain-text body" },
          },
          required: ["to", "subject", "body"],
        },
        async execute(
          _id: string,
          params: {
            to?: string[];
            cc?: string[];
            subject?: string;
            body?: string;
          },
        ) {
          const runtime = getRuntime();
          if (!params.to?.length) {
            return toolResult({ error: "to is required" });
          }
          if (!params.subject?.trim()) {
            return toolResult({ error: "subject is required" });
          }
          const res = await mailCall({
            proxyBaseUrl: runtime.proxyBaseUrl,
            projectId: runtime.projectId,
            evoclawId: runtime.evoclawId,
            apiKey: runtime.apiKey,
            action: "send",
            body: {
              to: params.to,
              cc: params.cc,
              subject: params.subject,
              body: params.body ?? "",
            },
          });
          return toolResult({
            status: res.status,
            body: tryParseJSON(res.bodyText),
          });
        },
      });
    } else {
      api.logger.warn(`[nango-proxy] unknown mail action: ${action}`);
      continue;
    }
    registered.push(t.name);
  }
  return registered;
}

export default {
  id: PLUGIN_ID,
  name: "Nango Proxy Connector",
  version: PLUGIN_VERSION,
  description:
    "Tools for 3rd-party providers via ai-assistant-nango-proxy (self-hosted Nango)",

  register(api: OpenClawPluginApi) {
    const getRuntime: GetRuntime = () =>
      resolveRuntime(readPluginConfig(api));

    try {
      getRuntime();
    } catch (err) {
      api.logger.error(
        `[nango-proxy] failed to resolve runtime: ${err instanceof Error ? err.message : String(err)}`,
      );
      return;
    }

    const registered: string[] = [];
    for (const meta of CATALOG) {
      if (meta.kind === "mail") {
        registered.push(...registerMailTools(api, getRuntime, meta));
      } else if (meta.kind === "disk") {
        registered.push(...registerDiskTools(api, getRuntime, meta));
      } else if (meta.kind === "calendar") {
        registered.push(...registerCalendarTools(api, getRuntime, meta));
      } else {
        registered.push(...registerProxyTool(api, getRuntime, meta));
      }
    }

    api.registerTool({
      name: LIST_CONNECTIONS_TOOL,
      description:
        "List currently connected 3rd-party integrations for this EvoClaw (from nango-proxy / Nango). " +
        "Call this before using integration tools if unsure whether the user has connected a provider.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      async execute() {
        const runtime = getRuntime();
        const res = await listConnections(runtime);
        const body = tryParseJSON(res.bodyText) as {
          connections?: Array<{
            type?: string;
            connectionId?: string;
            status?: string;
            enabled?: boolean;
          }>;
        };
        if (res.status >= 400) {
          return toolResult({
            status: res.status,
            error: "failed to list connections",
            body,
          });
        }
        const connections = (body.connections ?? []).map((c) => {
          const key = (c.type || "").trim();
          const meta = CATALOG_BY_KEY.get(key);
          return {
            type: key,
            connectionId: c.connectionId,
            status: c.status,
            enabled: c.enabled !== false,
            displayName: meta?.displayName || key,
            kind: meta?.kind ?? "proxy",
            tools: meta?.tools?.map((t) => t.name) ?? (meta ? [meta.tool] : []),
            upstreamBase: meta?.upstreamBase,
            examples: meta?.examples,
          };
        });
        return toolResult({ status: res.status, connections });
      },
    });

    api.logger.info(
      `[nango-proxy] v${PLUGIN_VERSION} registered ${registered.length + 1} tools (all enabled; connections resolved at call time)`,
    );
  },
};
