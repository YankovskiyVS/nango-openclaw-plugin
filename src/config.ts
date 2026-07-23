export type ProviderConfig = {
  /** Nango provider_config_key / integration type. */
  type: string;
  /** Optional override; defaults to type. */
  providerConfigKey?: string;
  /** Empty when the provider is listed but disabled (catalog-first config). */
  connectionId?: string;
  displayName?: string;
  /** Default false in catalog dump; flipped to true on connect. */
  enabled?: boolean;
};

export type PluginConfig = {
  /** Override NANGO_PROXY_URL. */
  proxyBaseUrl?: string;
  /** Env var name for API key (default CLOUDRU_API_KEY). */
  apiKeyEnv?: string;
  /**
   * Full catalog of providers (always present).
   * Tools are registered for every entry; only enabled+connectionId are callable.
   */
  providers?: ProviderConfig[];
};

export type ResolvedRuntime = {
  proxyBaseUrl: string;
  projectId: string;
  evoclawId: string;
  apiKey: string;
  /** Full providers list from live plugin config (including disabled stubs). */
  providers: ProviderConfig[];
};

export type GetRuntime = () => ResolvedRuntime;

function requiredEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(`nango-proxy plugin: missing required env ${name}`);
  }
  return v;
}

export function providerKey(p: ProviderConfig): string {
  return (p.providerConfigKey || p.type || "").trim();
}

/** Connected providers that may expose tools to the agent. */
export function isProviderActive(p: ProviderConfig | undefined): boolean {
  if (!p) return false;
  return p.enabled === true && Boolean(p.connectionId?.trim());
}

export function activeProviders(providers: ProviderConfig[]): ProviderConfig[] {
  return providers.filter(isProviderActive);
}

export function findProvider(
  providers: ProviderConfig[],
  key: string,
): ProviderConfig | undefined {
  const want = key.trim();
  return providers.find((p) => providerKey(p) === want);
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
    providers: cfg?.providers ?? [],
  };
}
