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

function buildCalendarUrl(
  proxyBaseUrl: string,
  projectId: string,
  evoclawId: string,
  action:
    | "list_calendars"
    | "create_calendar"
    | "list_events"
    | "get_event"
    | "create_event"
    | "update_event"
    | "delete_event",
  query?: string,
): string {
  const base = proxyBaseUrl.replace(/\/$/, "");
  let path: string;
  switch (action) {
    case "list_calendars":
    case "create_calendar":
      path = "calendar/calendars";
      break;
    case "list_events":
    case "create_event":
    case "update_event":
      path = "calendar/events";
      break;
    case "get_event":
    case "delete_event":
      path = "calendar/event";
      break;
  }
  let url = `${base}/api/v1/${projectId}/evo-claws/${evoclawId}/${path}`;
  if (query && query.trim()) {
    url += `?${query.replace(/^\?/, "")}`;
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

export async function calendarCall(input: {
  proxyBaseUrl: string;
  projectId: string;
  evoclawId: string;
  apiKey: string;
  action:
    | "list_calendars"
    | "create_calendar"
    | "list_events"
    | "get_event"
    | "create_event"
    | "update_event"
    | "delete_event";
  query?: string;
  body?: unknown;
  timeoutMs?: number;
}): Promise<ProxyCallResult> {
  const url = buildCalendarUrl(
    input.proxyBaseUrl,
    input.projectId,
    input.evoclawId,
    input.action,
    input.query,
  );
  let method = "GET";
  if (input.action === "create_event" || input.action === "create_calendar") method = "POST";
  else if (input.action === "update_event") method = "PUT";
  else if (input.action === "delete_event") method = "DELETE";
  return doFetch(url, method, input.apiKey, input.body, undefined, input.timeoutMs);
}

export async function listConnections(input: {
  proxyBaseUrl: string;
  projectId: string;
  evoclawId: string;
  apiKey: string;
  timeoutMs?: number;
}): Promise<ProxyCallResult> {
  const base = input.proxyBaseUrl.replace(/\/$/, "");
  const url =
    `${base}/api/v1/${input.projectId}/evo-claws/${input.evoclawId}/connections`;
  return doFetch(url, "GET", input.apiKey, undefined, undefined, input.timeoutMs ?? 30_000);
}

/** Liveness probe — optional; tools themselves return 404 when connection is missing. */
export async function isConnectionAlive(input: {
  proxyBaseUrl: string;
  projectId: string;
  evoclawId: string;
  apiKey: string;
  providerConfigKey: string;
}): Promise<boolean> {
  try {
    const listed = await listConnections({
      proxyBaseUrl: input.proxyBaseUrl,
      projectId: input.projectId,
      evoclawId: input.evoclawId,
      apiKey: input.apiKey,
      timeoutMs: 10_000,
    });
    if (listed.status >= 400) return false;
    const body = JSON.parse(listed.bodyText) as {
      connections?: Array<{ type?: string; enabled?: boolean }>;
    };
    return (body.connections ?? []).some(
      (c) => c.type === input.providerConfigKey && c.enabled !== false,
    );
  } catch {
    return false;
  }
}

export { buildUrl, buildMailUrl, buildCalendarUrl };
