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

function buildMailUrl(
  proxyBaseUrl: string,
  projectId: string,
  evoclawId: string,
  action: "list" | "get" | "send",
  query?: string,
): string {
  const base = proxyBaseUrl.replace(/\/$/, "");
  let url = `${base}/api/v1/${projectId}/evo-claws/${evoclawId}/mail/${action}`;
  if (query && query.trim()) {
    const q = query.replace(/^\?/, "");
    url += `?${q}`;
  }
  return url;
}

async function doFetch(
  url: string,
  method: string,
  apiKey: string,
  body?: unknown,
  headersExtra?: Record<string, string>,
  timeoutMs?: number,
): Promise<ProxyCallResult> {
  const headers: Record<string, string> = {
    Authorization: `Api-Key ${apiKey}`,
    ...(headersExtra ?? {}),
  };

  let bodyText: string | undefined;
  if (body !== undefined && body !== null) {
    if (typeof body === "string") {
      bodyText = body;
    } else {
      bodyText = JSON.stringify(body);
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    }
  }

  const m = (method || "GET").toUpperCase();
  const res = await fetch(url, {
    method: m,
    headers,
    body: m === "GET" || m === "HEAD" ? undefined : bodyText,
    signal: AbortSignal.timeout(timeoutMs ?? 120_000),
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

export async function proxyCall(input: ProxyCallInput): Promise<ProxyCallResult> {
  const url = buildUrl(
    input.proxyBaseUrl,
    input.projectId,
    input.evoclawId,
    input.providerConfigKey,
    input.endpoint,
    input.query,
  );
  return doFetch(url, input.method, input.apiKey, input.body, input.headers, input.timeoutMs);
}

export async function mailCall(input: {
  proxyBaseUrl: string;
  projectId: string;
  evoclawId: string;
  apiKey: string;
  action: "list" | "get" | "send";
  query?: string;
  body?: unknown;
  timeoutMs?: number;
}): Promise<ProxyCallResult> {
  const url = buildMailUrl(
    input.proxyBaseUrl,
    input.projectId,
    input.evoclawId,
    input.action,
    input.query,
  );
  const method = input.action === "send" ? "POST" : "GET";
  return doFetch(url, method, input.apiKey, input.body, undefined, input.timeoutMs);
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
    if (input.providerConfigKey === "yandex-mail") {
      const res = await mailCall({
        ...input,
        action: "list",
        query: "limit=1",
        timeoutMs: 15_000,
      });
      if (res.status === 401 || res.status === 403) return false;
      if (res.status === 404) return false;
      return res.status < 500;
    }
    const res = await proxyCall({
      ...input,
      method: "HEAD",
      endpoint: "/",
      timeoutMs: 5_000,
    });
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

export { buildUrl, buildMailUrl };
