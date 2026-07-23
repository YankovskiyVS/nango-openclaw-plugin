export type PluginConfig = {
  /** Override NANGO_PROXY_URL. */
  proxyBaseUrl?: string;
  /** Env var name for API key (default CLOUDRU_API_KEY). */
  apiKeyEnv?: string;
};

export type ResolvedRuntime = {
  proxyBaseUrl: string;
  projectId: string;
  evoclawId: string;
  apiKey: string;
};

export type GetRuntime = () => ResolvedRuntime;

function requiredEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(`nango-proxy plugin: missing required env ${name}`);
  }
  return v;
}

export function resolveRuntime(cfg: PluginConfig | undefined): ResolvedRuntime {
  const proxyBaseUrl = (
    cfg?.proxyBaseUrl?.trim() ||
    process.env.NANGO_PROXY_URL?.trim() ||
    "http://ai-assistant-nango-proxy.ai-assistant-nango-proxy.svc.cluster.local:8080"
  ).replace(/\/$/, "");

  const apiKeyEnv = cfg?.apiKeyEnv?.trim() || "CLOUDRU_API_KEY";

  return {
    proxyBaseUrl,
    projectId: requiredEnv("EVOLUTION_PROJECT_ID"),
    evoclawId: requiredEnv("EVOCLAW_ID"),
    apiKey: requiredEnv(apiKeyEnv),
  };
}
