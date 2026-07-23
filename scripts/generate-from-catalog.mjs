#!/usr/bin/env node
/**
 * Reads catalog/providers.yaml and regenerates:
 *   - src/catalog.generated.ts
 *   - openclaw.plugin.json (contracts.tools + configSchema enum)
 *
 * Usage: npm run generate
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const yamlPath = join(root, "catalog/providers.yaml");

const doc = parseYaml(readFileSync(yamlPath, "utf8"));
const providers = doc?.providers;
if (!Array.isArray(providers) || providers.length === 0) {
  console.error("catalog/providers.yaml: expected non-empty providers[]");
  process.exit(1);
}

function toolName(key) {
  return `nango_${String(key).replace(/-/g, "_")}_call`;
}

const catalog = providers.map((p) => {
  if (!p?.key) {
    throw new Error("provider entry missing key");
  }
  return {
    key: String(p.key),
    tool: toolName(p.key),
    displayName: String(p.displayName || p.key),
    family: String(p.family || ""),
    hint: String(p.hint || ""),
    upstreamBase: String(p.upstreamBase || ""),
    aliases: Array.isArray(p.aliases) ? p.aliases.map(String) : [],
    docs: p.docs ? String(p.docs) : undefined,
    notes: p.notes ? String(p.notes) : undefined,
    examples: Array.isArray(p.examples)
      ? p.examples.map((ex) => ({
          method: String(ex.method || "GET"),
          endpoint: String(ex.endpoint || ""),
          query: ex.query != null ? String(ex.query) : undefined,
          description: ex.description != null ? String(ex.description) : undefined,
        }))
      : [],
  };
});

const keys = catalog.map((p) => p.key);
const tools = [...catalog.map((p) => p.tool), "nango_list_connections"];

const ts = `/* AUTO-GENERATED from catalog/providers.yaml — do not edit by hand.
 * Run: npm run generate
 */
export type ProviderExample = {
  method: string;
  endpoint: string;
  query?: string;
  description?: string;
};

export type ProviderMeta = {
  key: string;
  tool: string;
  displayName: string;
  family: string;
  hint: string;
  /** Upstream API base URL resolved by Nango (agent passes path relative to this). */
  upstreamBase: string;
  aliases: string[];
  docs?: string;
  notes?: string;
  examples: ProviderExample[];
};

export const CATALOG: readonly ProviderMeta[] = ${JSON.stringify(catalog, null, 2)} as const;

export const CATALOG_BY_KEY: ReadonlyMap<string, ProviderMeta> = new Map(
  CATALOG.flatMap((p) => {
    const entries: Array<[string, ProviderMeta]> = [[p.key, p]];
    for (const a of p.aliases) entries.push([a, p]);
    return entries;
  }),
);

export const CATALOG_BY_TOOL: ReadonlyMap<string, ProviderMeta> = new Map(
  CATALOG.map((p) => [p.tool, p]),
);

export const LIST_CONNECTIONS_TOOL = "nango_list_connections";

export function allContractTools(): string[] {
  return ${JSON.stringify(tools)};
}

export function toolNameForKey(key: string): string {
  return \`nango_\${key.replace(/-/g, "_")}_call\`;
}

/** Human-readable tool description for the model (includes upstream + examples). */
export function buildToolDescription(meta: ProviderMeta, displayName?: string): string {
  const label = displayName || meta.displayName || meta.key;
  const lines = [
    \`Call \${label} (\${meta.key}) via ai-assistant-nango-proxy → Nango → provider API.\`,
    meta.hint,
    meta.upstreamBase
      ? \`Upstream base (Nango): \${meta.upstreamBase}. Pass endpoint as path relative to this base.\`
      : "",
    "Proxy URL shape: {NANGO_PROXY_URL}/api/v1/{projectId}/evo-claws/{evoclawId}/proxy/" +
      meta.key +
      "/{endpoint}",
  ];
  if (meta.examples?.length) {
    lines.push("Examples:");
    for (const ex of meta.examples) {
      const q = ex.query ? \`?\${ex.query}\` : "";
      const desc = ex.description ? \` — \${ex.description}\` : "";
      lines.push(\`- \${ex.method} \${ex.endpoint}\${q}\${desc}\`);
    }
  }
  if (meta.notes) lines.push(\`Note: \${meta.notes}\`);
  if (meta.docs) lines.push(\`Docs: \${meta.docs}\`);
  return lines.filter(Boolean).join(" ");
}
`;

writeFileSync(join(root, "src/catalog.generated.ts"), ts);

const manifest = {
  id: "nango-proxy",
  name: "Nango Proxy Connector",
  description:
    "Tools OpenClaw for calling 3rd-party providers via ai-assistant-nango-proxy (self-hosted Nango). Catalog: catalog/providers.yaml",
  version: "0.2.0",
  configSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      proxyBaseUrl: {
        type: "string",
        description:
          "Override NANGO_PROXY_URL, e.g. http://ai-assistant-nango-proxy.ai-assistant-nango-proxy.svc.cluster.local:8080",
      },
      apiKeyEnv: {
        type: "string",
        description: "Env var with Cloud.ru API key (default CLOUDRU_API_KEY)",
        default: "CLOUDRU_API_KEY",
      },
      providers: {
        type: "array",
        description: "Active connections; managed by control plane / operator",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            type: { type: "string", enum: keys },
            providerConfigKey: { type: "string" },
            connectionId: { type: "string" },
            displayName: { type: "string" },
            enabled: { type: "boolean", default: true },
          },
          required: ["type", "connectionId"],
        },
      },
    },
  },
  contracts: { tools },
};

writeFileSync(
  join(root, "openclaw.plugin.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

console.log(
  `generated ${catalog.length} providers, ${tools.length} contract tools from catalog/providers.yaml`,
);
