export type ProxyCallInput = {
  proxyBaseUrl: string;
  projectId: string;
  evoclawId: string;
  apiKey: string;
  providerConfigKey: string;
  method: string;
  endpoint: string;
  query?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export type ProxyCallResult = {
  status: number;
  headers: Record<string, string>;
  bodyText: string;
};

function buildUrl(
  proxyBaseUrl: string,
  projectId: string,
  evoclawId: string,
  providerConfigKey: string,
  endpoint: string,
  query?: string,
): string {
  const base = proxyBaseUrl.replace(/\/$/, "");
  const upstream = endpoint.replace(/^\//, "");
  let url =
    `${base}/api/v1/${projectId}/evo-claws/${evoclawId}` +
    `/proxy/${providerConfigKey}/${upstream}`;
  if (query && query.trim()) {
    const q = query.replace(/^\?/, "");
    url += (url.includes("?") ? "&" : "?") + q;
  }
  return url;
}

export async function proxyCall(input: ProxyCallInput): Promise<ProxyCallResult> {
  const url = buildUrl(
    input.proxyBaseUrl,
    input.projectId,
    input.evoclawId,
    input.providerConfigKey,
    input.endpoint,
    input.query,
  );

  const headers: Record<string, string> = {
    Authorization: `Api-Key ${input.apiKey}`,
    ...(input.headers ?? {}),
  };

  let body: string | undefined;
  if (input.body !== undefined && input.body !== null) {
    if (typeof input.body === "string") {
      body = input.body;
    } else {
      body = JSON.stringify(input.body);
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    }
  }

  const method = (input.method || "GET").toUpperCase();
  const res = await fetch(url, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : body,
    signal: AbortSignal.timeout(input.timeoutMs ?? 120_000),
  });

  const outHeaders: Record<string, string> = {};
  res.headers.forEach((v, k) => {
    outHeaders[k] = v;
  });

  return {
    status: res.status,
    headers: outHeaders,
    bodyText: await res.text(),
  };
}

/** Cheap liveness probe: HEAD against provider root through the proxy. */
export async function isConnectionAlive(input: {
  proxyBaseUrl: string;
  projectId: string;
  evoclawId: string;
  apiKey: string;
  providerConfigKey: string;
}): Promise<boolean> {
  try {
    const res = await proxyCall({
      ...input,
      method: "HEAD",
      endpoint: "/",
      timeoutMs: 5_000,
    });
    // 404/401 from proxy = connection missing / auth; 2xx/4xx from upstream = alive.
    if (res.status === 401 || res.status === 403) return false;
    if (res.status === 404) {
      const lower = res.bodyText.toLowerCase();
      if (lower.includes("not found") || lower.includes("connection")) return false;
    }
    return res.status < 500;
  } catch {
    return false;
  }
}

export { buildUrl };
