export type ProviderConfig = {
  /** Nango provider_config_key / integration type. */
  type: string;
  /** Optional override; defaults to type. */
  providerConfigKey?: string;
  connectionId: string;
  displayName?: string;
  enabled?: boolean;
};

export type PluginConfig = {
  /** Override NANGO_PROXY_URL. */
  proxyBaseUrl?: string;
  /** Env var name for API key (default CLOUDRU_API_KEY). */
  apiKeyEnv?: string;
  /** Active connections managed by control plane. */
  providers?: ProviderConfig[];
};

export type ResolvedRuntime = {
  proxyBaseUrl: string;
  projectId: string;
  evoclawId: string;
  apiKey: string;
  providers: ProviderConfig[];
};

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
  const providers = (cfg?.providers ?? []).filter((p) => p.enabled !== false);

  return {
    proxyBaseUrl,
    projectId: requiredEnv("EVOLUTION_PROJECT_ID"),
    evoclawId: requiredEnv("EVOCLAW_ID"),
    apiKey: requiredEnv(apiKeyEnv),
    providers,
  };
}

export function providerKey(p: ProviderConfig): string {
  return (p.providerConfigKey || p.type || "").trim();
}
