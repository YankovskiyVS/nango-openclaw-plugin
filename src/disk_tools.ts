import { readFile } from "node:fs/promises";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { buildToolDescription, type ProviderMeta } from "./catalog.js";
import { type GetRuntime, type ResolvedRuntime } from "./config.js";
import { proxyCall } from "./proxy.js";

function registerOptionalTool(
  api: OpenClawPluginApi,
  tool: Parameters<OpenClawPluginApi["registerTool"]>[0],
) {
  api.registerTool(tool, { optional: true });
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

/** Yandex Disk paths must be absolute (`/folder/file`). Strip optional `disk:` prefix. */
export function normalizeDiskPath(path: string | undefined, fallback = "/"): string {
  let p = (path ?? "").trim();
  if (!p) return fallback;
  if (p.toLowerCase().startsWith("disk:")) {
    p = p.slice(5);
  }
  if (!p.startsWith("/")) {
    p = `/${p}`;
  }
  return p;
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

async function uploadLocalFile(
  runtime: ResolvedRuntime,
  destPath: string,
  localPath: string,
  overwrite: boolean,
) {
  const linkRes = await proxyCall({
    proxyBaseUrl: runtime.proxyBaseUrl,
    projectId: runtime.projectId,
    evoclawId: runtime.evoclawId,
    apiKey: runtime.apiKey,
    providerConfigKey: "yandex-disk",
    method: "GET",
    endpoint: "v1/disk/resources/upload",
    query: q({ path: destPath, overwrite }),
  });
  if (linkRes.status >= 400) {
    return toolResult({
      error: "failed to get upload URL",
      status: linkRes.status,
      body: tryParseJSON(linkRes.bodyText),
      path: destPath,
    });
  }
  const link = tryParseJSON(linkRes.bodyText) as {
    href?: string;
    method?: string;
  };
  if (!link?.href) {
    return toolResult({
      error: "upload URL response missing href",
      status: linkRes.status,
      body: link,
      path: destPath,
    });
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(localPath);
  } catch (err) {
    return toolResult({
      error: `failed to read local file: ${err instanceof Error ? err.message : String(err)}`,
      localPath,
      path: destPath,
    });
  }

  const method = (link.method || "PUT").toUpperCase();
  const putRes = await fetch(link.href, {
    method,
    body: new Uint8Array(bytes),
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(bytes.length),
    },
    signal: AbortSignal.timeout(300_000),
  });
  const putBody = await putRes.text();
  return toolResult({
    status: putRes.status,
    path: destPath,
    localPath,
    bytes: bytes.length,
    uploadUrl: link.href,
    body: putBody ? tryParseJSON(putBody) : null,
    ok: putRes.status === 201 || putRes.status === 202,
  });
}

export function registerDiskTools(
  api: OpenClawPluginApi,
  getRuntime: GetRuntime,
  meta: ProviderMeta,
): string[] {
  const label = meta.displayName || meta.key;
  const registered: string[] = [];

  for (const t of meta.tools) {
    const action = t.action;
    const desc = buildToolDescription(meta, label, t.name);

    switch (action) {
      case "info":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: { type: "object", additionalProperties: false, properties: {} },
          async execute() {
            return diskProxy(getRuntime(), "GET", "v1/disk");
          },
        });
        break;
      case "list":
      case "get":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: {
                type: "string",
                description: "Absolute Disk path, e.g. / or /folder/file.txt",
                default: "/",
              },
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
              getRuntime(),
              "GET",
              "v1/disk/resources",
              q({
                path: normalizeDiskPath(params.path, "/"),
                limit: params.limit != null ? String(params.limit) : undefined,
                offset: params.offset != null ? String(params.offset) : undefined,
              }),
            );
          },
        });
        break;
      case "files":
        registerOptionalTool(api, {
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
              getRuntime(),
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
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: { limit: { type: "number" } },
          },
          async execute(_id: string, params: { limit?: number }) {
            return diskProxy(
              getRuntime(),
              "GET",
              "v1/disk/resources/last-uploaded",
              q({ limit: params.limit != null ? String(params.limit) : undefined }),
            );
          },
        });
        break;
      case "mkdir":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: {
                type: "string",
                description: "Absolute folder path to create, e.g. /reports/2026",
              },
            },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string }) {
            if (!params.path?.trim()) return toolResult({ error: "path is required" });
            return diskProxy(
              getRuntime(),
              "PUT",
              "v1/disk/resources",
              q({ path: normalizeDiskPath(params.path) }),
            );
          },
        });
        break;
      case "upload":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: {
                type: "string",
                description:
                  "Destination path on Yandex Disk (absolute, e.g. /docs/file.pdf)",
              },
              localPath: {
                type: "string",
                description: "Absolute path to a local file on the EvoClaw host to upload",
              },
              overwrite: { type: "boolean", default: true },
            },
            required: ["path", "localPath"],
          },
          async execute(
            _id: string,
            params: { path?: string; localPath?: string; overwrite?: boolean },
          ) {
            if (!params.path?.trim()) return toolResult({ error: "path is required" });
            if (!params.localPath?.trim()) {
              return toolResult({ error: "localPath is required" });
            }
            return uploadLocalFile(
              getRuntime(),
              normalizeDiskPath(params.path),
              params.localPath.trim(),
              params.overwrite !== false,
            );
          },
        });
        break;
      case "upload_link":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: {
                type: "string",
                description:
                  "Absolute destination path on Disk, e.g. /folder/file.pdf (leading / required)",
              },
              overwrite: { type: "boolean", default: true },
            },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string; overwrite?: boolean }) {
            if (!params.path?.trim()) return toolResult({ error: "path is required" });
            return diskProxy(
              getRuntime(),
              "GET",
              "v1/disk/resources/upload",
              q({
                path: normalizeDiskPath(params.path),
                overwrite: params.overwrite !== false,
              }),
            );
          },
        });
        break;
      case "download_link":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: {
                type: "string",
                description: "Absolute Disk path to download, e.g. /folder/file.pdf",
              },
            },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string }) {
            if (!params.path?.trim()) return toolResult({ error: "path is required" });
            return diskProxy(
              getRuntime(),
              "GET",
              "v1/disk/resources/download",
              q({ path: normalizeDiskPath(params.path) }),
            );
          },
        });
        break;
      case "copy":
      case "move":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              from: { type: "string", description: "Source absolute path" },
              path: { type: "string", description: "Destination absolute path" },
              overwrite: { type: "boolean", default: true },
            },
            required: ["from", "path"],
          },
          async execute(
            _id: string,
            params: { from?: string; path?: string; overwrite?: boolean },
          ) {
            if (!params.from?.trim() || !params.path?.trim()) {
              return toolResult({ error: "from and path are required" });
            }
            return diskProxy(
              getRuntime(),
              "POST",
              `v1/disk/resources/${action}`,
              q({
                from: normalizeDiskPath(params.from),
                path: normalizeDiskPath(params.path),
                overwrite: params.overwrite !== false,
              }),
            );
          },
        });
        break;
      case "delete":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: { type: "string", description: "Absolute Disk path to delete" },
              permanently: { type: "boolean", default: false },
            },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string; permanently?: boolean }) {
            if (!params.path?.trim()) return toolResult({ error: "path is required" });
            return diskProxy(
              getRuntime(),
              "DELETE",
              "v1/disk/resources",
              q({
                path: normalizeDiskPath(params.path),
                permanently: !!params.permanently,
              }),
            );
          },
        });
        break;
      case "publish":
      case "unpublish":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: { type: "string", description: "Absolute Disk path" },
            },
            required: ["path"],
          },
          async execute(_id: string, params: { path?: string }) {
            if (!params.path?.trim()) return toolResult({ error: "path is required" });
            return diskProxy(
              getRuntime(),
              "PUT",
              `v1/disk/resources/${action}`,
              q({ path: normalizeDiskPath(params.path) }),
            );
          },
        });
        break;
      case "trash_list":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: { type: "string", default: "/" },
              limit: { type: "number" },
            },
          },
          async execute(_id: string, params: { path?: string; limit?: number }) {
            return diskProxy(
              getRuntime(),
              "GET",
              "v1/disk/trash/resources",
              q({
                path: normalizeDiskPath(params.path, "/"),
                limit: params.limit != null ? String(params.limit) : undefined,
              }),
            );
          },
        });
        break;
      case "trash_restore":
        registerOptionalTool(api, {
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
            if (!params.path?.trim()) return toolResult({ error: "path is required" });
            return diskProxy(
              getRuntime(),
              "PUT",
              "v1/disk/trash/resources/restore",
              q({
                path: normalizeDiskPath(params.path),
                name: params.name,
                overwrite: params.overwrite,
              }),
            );
          },
        });
        break;
      case "trash_empty":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: { type: "object", additionalProperties: false, properties: {} },
          async execute() {
            return diskProxy(getRuntime(), "DELETE", "v1/disk/trash/resources");
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
