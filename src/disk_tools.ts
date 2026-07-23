import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { buildToolDescription, type ProviderMeta } from "./catalog.js";
import { type ProviderConfig, type ResolvedRuntime, providerKey } from "./config.js";
import { proxyCall } from "./proxy.js";

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

async function diskProxy(
  runtime: ResolvedRuntime,
  method: string,
  endpoint: string,
  query?: string,
) {
  const res = await proxyCall({
    proxyBaseUrl: runtime.proxyBaseUrl,
    projectId: runtime.projectId,
    evoclawId: runtime.evoclawId,
    apiKey: runtime.apiKey,
    providerConfigKey: "yandex-disk",
    method,
    endpoint,
    query,
  });
  return toolResult({ status: res.status, body: tryParseJSON(res.bodyText) });
}

function q(params: Record<string, string | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

export function registerDiskTools(
  api: OpenClawPluginApi,
  runtime: ResolvedRuntime,
  provider: ProviderConfig,
  meta: ProviderMeta,
): string[] {
  const label = provider.displayName || meta.displayName || providerKey(provider);
  const registered: string[] = [];

  for (const t of meta.tools) {
    const action = t.action;
    const desc = buildToolDescription(meta, label, t.name);

    switch (action) {
      case "info":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: { type: "object", additionalProperties: false, properties: {} },
          async execute() {
            return diskProxy(runtime, "GET", "v1/disk");
          },
        });
        break;
      case "list":
      case "get":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: { type: "string", description: "Disk path, e.g. / or /folder/file.txt", default: "/" },
              limit: { type: "number", description: "Max items (list)" },
              offset: { type: "number" },
            },
            required: action === "get" ? ["path"] : [],
          },
          async execute(
            _id: string,
            params: { path?: string; limit?: number; offset?: number },
          ) {
            return diskProxy(
              runtime,
              "GET",
              "v1/disk/resources",
              q({
                path: params.path || "/",
                limit: params.limit != null ? String(params.limit) : undefined,
                offset: params.offset != null ? String(params.offset) : undefined,
              }),
            );
          },
        });
        break;
      case "files":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              limit: { type: "number" },
              offset: { type: "number" },
            },
          },
          async execute(_id: string, params: { limit?: number; offset?: number }) {
            return diskProxy(
              runtime,
              "GET",
              "v1/disk/resources/files",
              q({
                limit: params.limit != null ? String(params.limit) : undefined,
                offset: params.offset != null ? String(params.offset) : undefined,
              }),
            );
          },
        });
        break;
      case "last_uploaded":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: { limit: { type: "number" } },
          },
          async execute(_id: string, params: { limit?: number }) {
            return diskProxy(
              runtime,
              "GET",
              "v1/disk/resources/last-uploaded",
              q({ limit: params.limit != null ? String(params.limit) : undefined }),
            );
          },
        });
        break;
      case "mkdir":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: { path: { type: "string", description: "Folder path to create" } },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string }) {
            if (!params.path) return toolResult({ error: "path is required" });
            return diskProxy(runtime, "PUT", "v1/disk/resources", q({ path: params.path }));
          },
        });
        break;
      case "upload_link":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: { type: "string" },
              overwrite: { type: "boolean", default: true },
            },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string; overwrite?: boolean }) {
            if (!params.path) return toolResult({ error: "path is required" });
            return diskProxy(
              runtime,
              "GET",
              "v1/disk/resources/upload",
              q({ path: params.path, overwrite: params.overwrite !== false }),
            );
          },
        });
        break;
      case "download_link":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: { path: { type: "string" } },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string }) {
            if (!params.path) return toolResult({ error: "path is required" });
            return diskProxy(runtime, "GET", "v1/disk/resources/download", q({ path: params.path }));
          },
        });
        break;
      case "copy":
      case "move":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              from: { type: "string", description: "Source path" },
              path: { type: "string", description: "Destination path" },
              overwrite: { type: "boolean", default: true },
            },
            required: ["from", "path"],
          },
          async execute(
            _id: string,
            params: { from?: string; path?: string; overwrite?: boolean },
          ) {
            if (!params.from || !params.path) {
              return toolResult({ error: "from and path are required" });
            }
            return diskProxy(
              runtime,
              "POST",
              `v1/disk/resources/${action}`,
              q({
                from: params.from,
                path: params.path,
                overwrite: params.overwrite !== false,
              }),
            );
          },
        });
        break;
      case "delete":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: { type: "string" },
              permanently: { type: "boolean", default: false },
            },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string; permanently?: boolean }) {
            if (!params.path) return toolResult({ error: "path is required" });
            return diskProxy(
              runtime,
              "DELETE",
              "v1/disk/resources",
              q({ path: params.path, permanently: !!params.permanently }),
            );
          },
        });
        break;
      case "publish":
      case "unpublish":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: { path: { type: "string" } },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string }) {
            if (!params.path) return toolResult({ error: "path is required" });
            return diskProxy(
              runtime,
              "PUT",
              `v1/disk/resources/${action}`,
              q({ path: params.path }),
            );
          },
        });
        break;
      case "trash_list":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: { path: { type: "string", default: "/" }, limit: { type: "number" } },
          },
          async execute(_id: string, params: { path?: string; limit?: number }) {
            return diskProxy(
              runtime,
              "GET",
              "v1/disk/trash/resources",
              q({
                path: params.path || "/",
                limit: params.limit != null ? String(params.limit) : undefined,
              }),
            );
          },
        });
        break;
      case "trash_restore":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: { type: "string", description: "Path in trash" },
              name: { type: "string", description: "Optional new name" },
              overwrite: { type: "boolean" },
            },
            required: ["path"],
          },
          async execute(
            _id: string,
            params: { path?: string; name?: string; overwrite?: boolean },
          ) {
            if (!params.path) return toolResult({ error: "path is required" });
            return diskProxy(
              runtime,
              "PUT",
              "v1/disk/trash/resources/restore",
              q({
                path: params.path,
                name: params.name,
                overwrite: params.overwrite,
              }),
            );
          },
        });
        break;
      case "trash_empty":
        api.registerTool({
          name: t.name,
          description: desc,
          parameters: { type: "object", additionalProperties: false, properties: {} },
          async execute() {
            return diskProxy(runtime, "DELETE", "v1/disk/trash/resources");
          },
        });
        break;
      default:
        api.logger.warn(`[nango-proxy] unknown disk action: ${action}`);
        continue;
    }
    registered.push(t.name);
  }
  return registered;
}
