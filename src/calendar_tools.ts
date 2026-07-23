import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { buildToolDescription, type ProviderMeta } from "./catalog.js";
import { type GetRuntime } from "./config.js";
import { calendarCall } from "./proxy.js";

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

const calendarParamDescription =
  "Calendar selector: omit for default (events-default / «Мои события»), " +
  "or pass displayName exactly as in list_calendars, or the calendar href " +
  "(e.g. /calendars/user@yandex.ru/events-default/). Do NOT invent path slugs from the title.";

export function registerCalendarTools(
  api: OpenClawPluginApi,
  getRuntime: GetRuntime,
  meta: ProviderMeta,
): string[] {
  const label = meta.displayName || meta.key;
  const registered: string[] = [];
  const base = () => {
    const runtime = getRuntime();
    return {
      proxyBaseUrl: runtime.proxyBaseUrl,
      projectId: runtime.projectId,
      evoclawId: runtime.evoclawId,
      apiKey: runtime.apiKey,
    };
  };

  for (const t of meta.tools) {
    const action = t.action;
    const desc = buildToolDescription(meta, label, t.name);

    switch (action) {
      case "list_calendars":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: { type: "object", additionalProperties: false, properties: {} },
          async execute() {
            const res = await calendarCall({ ...base(), action: "list_calendars" });
            return toolResult({ status: res.status, body: tryParseJSON(res.bodyText) });
          },
        });
        break;
      case "create_calendar":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              displayName: {
                type: "string",
                description: "Human-readable calendar title, e.g. Рабочий",
              },
              id: {
                type: "string",
                description:
                  "Optional ASCII collection id for the CalDAV URL (alphanumeric/dash). Auto-generated when omitted.",
              },
            },
            required: ["displayName"],
          },
          async execute(_id: string, params: { displayName?: string; id?: string }) {
            if (!params.displayName?.trim()) {
              return toolResult({ error: "displayName is required" });
            }
            const res = await calendarCall({
              ...base(),
              action: "create_calendar",
              body: {
                displayName: params.displayName.trim(),
                id: params.id?.trim() || undefined,
              },
            });
            return toolResult({ status: res.status, body: tryParseJSON(res.bodyText) });
          },
        });
        break;
      case "list_events":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              calendar: { type: "string", description: calendarParamDescription },
              start: { type: "string", description: "Range start (RFC3339 or YYYY-MM-DD)" },
              end: { type: "string", description: "Range end (RFC3339 or YYYY-MM-DD)" },
            },
          },
          async execute(
            _id: string,
            params: { calendar?: string; start?: string; end?: string },
          ) {
            const q = new URLSearchParams();
            if (params.calendar) q.set("calendar", params.calendar);
            if (params.start) q.set("start", params.start);
            if (params.end) q.set("end", params.end);
            const res = await calendarCall({
              ...base(),
              action: "list_events",
              query: q.toString(),
            });
            return toolResult({ status: res.status, body: tryParseJSON(res.bodyText) });
          },
        });
        break;
      case "get_event":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: { href: { type: "string", description: "Event href (.ics path)" } },
            required: ["href"],
          },
          async execute(_id: string, params: { href?: string }) {
            if (!params.href) return toolResult({ error: "href is required" });
            const res = await calendarCall({
              ...base(),
              action: "get_event",
              query: `href=${encodeURIComponent(params.href)}`,
            });
            return toolResult({ status: res.status, body: tryParseJSON(res.bodyText) });
          },
        });
        break;
      case "create_event":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              description: { type: "string" },
              location: { type: "string" },
              start: { type: "string", description: "RFC3339 or YYYY-MM-DD" },
              end: { type: "string" },
              calendar: { type: "string", description: calendarParamDescription },
              uid: { type: "string", description: "Optional; auto-generated if omitted" },
            },
            required: ["summary", "start", "end"],
          },
          async execute(
            _id: string,
            params: {
              summary?: string;
              description?: string;
              location?: string;
              start?: string;
              end?: string;
              calendar?: string;
              uid?: string;
            },
          ) {
            const res = await calendarCall({
              ...base(),
              action: "create_event",
              body: params,
            });
            return toolResult({ status: res.status, body: tryParseJSON(res.bodyText) });
          },
        });
        break;
      case "update_event":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              uid: { type: "string", description: "Event UID (required)" },
              summary: { type: "string" },
              description: { type: "string" },
              location: { type: "string" },
              start: { type: "string" },
              end: { type: "string" },
              calendar: { type: "string", description: calendarParamDescription },
            },
            required: ["uid", "summary", "start", "end"],
          },
          async execute(_id: string, params: Record<string, unknown>) {
            const res = await calendarCall({
              ...base(),
              action: "update_event",
              body: params,
            });
            return toolResult({ status: res.status, body: tryParseJSON(res.bodyText) });
          },
        });
        break;
      case "delete_event":
        registerOptionalTool(api, {
          name: t.name,
          description: desc,
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: { href: { type: "string" } },
            required: ["href"],
          },
          async execute(_id: string, params: { href?: string }) {
            if (!params.href) return toolResult({ error: "href is required" });
            const res = await calendarCall({
              ...base(),
              action: "delete_event",
              query: `href=${encodeURIComponent(params.href)}`,
            });
            return toolResult({ status: res.status, body: tryParseJSON(res.bodyText) });
          },
        });
        break;
      default:
        api.logger.warn(`[nango-proxy] unknown calendar action: ${action}`);
        continue;
    }
    registered.push(t.name);
  }
  return registered;
}
