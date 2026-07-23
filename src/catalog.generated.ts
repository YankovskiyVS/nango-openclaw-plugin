/* AUTO-GENERATED from catalog/providers.yaml — do not edit by hand.
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

export const CATALOG: readonly ProviderMeta[] = [
  {
    "key": "yandex-id",
    "tool": "nango_yandex_id_call",
    "displayName": "Yandex ID",
    "family": "yandex",
    "hint": "Yandex profile, login, email, avatar",
    "upstreamBase": "https://login.yandex.ru",
    "aliases": [
      "yandex"
    ],
    "examples": [
      {
        "method": "GET",
        "endpoint": "info",
        "query": "format=json",
        "description": "Get connected user profile"
      }
    ]
  },
  {
    "key": "yandex-disk",
    "tool": "nango_yandex_disk_call",
    "displayName": "Yandex Disk",
    "family": "yandex",
    "hint": "Yandex Disk files and folders",
    "upstreamBase": "https://cloud-api.yandex.net",
    "aliases": [],
    "docs": "https://yandex.com/dev/disk/api/concepts/about.html",
    "examples": [
      {
        "method": "GET",
        "endpoint": "v1/disk",
        "description": "Disk meta"
      },
      {
        "method": "GET",
        "endpoint": "v1/disk/resources",
        "query": "path=/",
        "description": "List root resources"
      }
    ]
  },
  {
    "key": "yandex-mail",
    "tool": "nango_yandex_mail_call",
    "displayName": "Yandex Mail",
    "family": "yandex",
    "hint": "Yandex Mail identity (IMAP/SMTP mail is not REST via proxy)",
    "upstreamBase": "https://login.yandex.ru",
    "aliases": [],
    "notes": "Mailbox read/send is IMAP/SMTP + XOAUTH2, not Nango REST proxy.",
    "examples": [
      {
        "method": "GET",
        "endpoint": "info",
        "query": "format=json",
        "description": "Mailbox identity via login.info"
      }
    ]
  },
  {
    "key": "yandex-calendar",
    "tool": "nango_yandex_calendar_call",
    "displayName": "Yandex Calendar",
    "family": "yandex",
    "hint": "Yandex Calendar events and calendars",
    "upstreamBase": "https://caldav.yandex.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "calendars/",
        "description": "List calendars"
      }
    ]
  },
  {
    "key": "yandex-direct",
    "tool": "nango_yandex_direct_call",
    "displayName": "Yandex Direct",
    "family": "yandex",
    "hint": "Yandex Direct campaigns, ads, reports",
    "upstreamBase": "https://api.direct.yandex.com",
    "aliases": [],
    "examples": [
      {
        "method": "POST",
        "endpoint": "json/v5/campaigns",
        "description": "Get campaigns (JSON-RPC body)"
      }
    ]
  },
  {
    "key": "yandex-maps",
    "tool": "nango_yandex_maps_call",
    "displayName": "Yandex Maps",
    "family": "yandex",
    "hint": "Yandex Maps bookmarks / saved places",
    "upstreamBase": "https://api-maps.yandex.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "v1/",
        "description": "Maps bookmarks API root"
      }
    ]
  },
  {
    "key": "yandex-market",
    "tool": "nango_yandex_market_call",
    "displayName": "Yandex Market Partner",
    "family": "yandex",
    "hint": "Yandex Market partner campaigns and offers",
    "upstreamBase": "https://api.partner.market.yandex.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "v2/campaigns",
        "description": "List partner campaigns"
      }
    ]
  },
  {
    "key": "yandex-delivery",
    "tool": "nango_yandex_delivery_call",
    "displayName": "Yandex Delivery Partner",
    "family": "yandex",
    "hint": "Yandex Delivery offers, claims, logistics",
    "upstreamBase": "https://b2b.taxi.yandex.net",
    "aliases": [],
    "examples": [
      {
        "method": "POST",
        "endpoint": "api/b2b/platform/offers/create",
        "description": "Create delivery offer"
      }
    ]
  },
  {
    "key": "bitrix24",
    "tool": "nango_bitrix24_call",
    "displayName": "Bitrix24",
    "family": "bitrix24",
    "hint": "Generic Bitrix24 REST",
    "upstreamBase": "https://{domain}/rest",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "user.current",
        "description": "Current user"
      }
    ]
  },
  {
    "key": "bitrix24-crm",
    "tool": "nango_bitrix24_crm_call",
    "displayName": "Bitrix24 CRM",
    "family": "bitrix24",
    "hint": "Bitrix24 leads, deals, contacts, companies",
    "upstreamBase": "https://{domain}/rest",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "crm.lead.list",
        "description": "List leads"
      },
      {
        "method": "GET",
        "endpoint": "crm.deal.list",
        "description": "List deals"
      }
    ]
  },
  {
    "key": "bitrix24-tasks",
    "tool": "nango_bitrix24_tasks_call",
    "displayName": "Bitrix24 Tasks",
    "family": "bitrix24",
    "hint": "Bitrix24 tasks and projects",
    "upstreamBase": "https://{domain}/rest",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "tasks.task.list",
        "description": "List tasks"
      }
    ]
  },
  {
    "key": "bitrix24-disk",
    "tool": "nango_bitrix24_disk_call",
    "displayName": "Bitrix24 Disk",
    "family": "bitrix24",
    "hint": "Bitrix24 Drive files and folders",
    "upstreamBase": "https://{domain}/rest",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "disk.storage.getlist",
        "description": "List storages"
      }
    ]
  },
  {
    "key": "bitrix24-im",
    "tool": "nango_bitrix24_im_call",
    "displayName": "Bitrix24 Messenger",
    "family": "bitrix24",
    "hint": "Bitrix24 chats and open lines",
    "upstreamBase": "https://{domain}/rest",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "im.recent.get",
        "description": "Recent chats"
      }
    ]
  },
  {
    "key": "bitrix24-user",
    "tool": "nango_bitrix24_user_call",
    "displayName": "Bitrix24 Users",
    "family": "bitrix24",
    "hint": "Bitrix24 employees and departments",
    "upstreamBase": "https://{domain}/rest",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "user.current",
        "description": "Current user"
      },
      {
        "method": "GET",
        "endpoint": "department.get",
        "description": "Departments"
      }
    ]
  },
  {
    "key": "bitrix24-calendar",
    "tool": "nango_bitrix24_calendar_call",
    "displayName": "Bitrix24 Calendar",
    "family": "bitrix24",
    "hint": "Bitrix24 calendar and rooms",
    "upstreamBase": "https://{domain}/rest",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "calendar.section.get",
        "description": "Calendar sections"
      }
    ]
  },
  {
    "key": "bitrix24-bizproc",
    "tool": "nango_bitrix24_bizproc_call",
    "displayName": "Bitrix24 Bizproc",
    "family": "bitrix24",
    "hint": "Bitrix24 workflows and robots",
    "upstreamBase": "https://{domain}/rest",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "bizproc.workflow.template.list",
        "description": "Workflow templates"
      }
    ]
  },
  {
    "key": "bitrix24-telephony",
    "tool": "nango_bitrix24_telephony_call",
    "displayName": "Bitrix24 Telephony",
    "family": "bitrix24",
    "hint": "Bitrix24 calls and records",
    "upstreamBase": "https://{domain}/rest",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "telephony.externalLine.get",
        "description": "External lines"
      }
    ]
  },
  {
    "key": "amocrm",
    "tool": "nango_amocrm_call",
    "displayName": "amoCRM",
    "family": "amocrm",
    "hint": "Generic amoCRM REST",
    "upstreamBase": "https://{subdomain}.amocrm.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "api/v4/account",
        "description": "Account info"
      }
    ]
  },
  {
    "key": "amocrm-crm",
    "tool": "nango_amocrm_crm_call",
    "displayName": "amoCRM CRM",
    "family": "amocrm",
    "hint": "amoCRM deals, contacts, pipelines",
    "upstreamBase": "https://{subdomain}.amocrm.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "api/v4/leads",
        "description": "List leads"
      },
      {
        "method": "GET",
        "endpoint": "api/v4/contacts",
        "description": "List contacts"
      }
    ]
  },
  {
    "key": "amocrm-catalog",
    "tool": "nango_amocrm_catalog_call",
    "displayName": "amoCRM Catalog",
    "family": "amocrm",
    "hint": "amoCRM products and catalogs",
    "upstreamBase": "https://{subdomain}.amocrm.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "api/v4/catalogs",
        "description": "List catalogs"
      }
    ]
  },
  {
    "key": "amocrm-chats",
    "tool": "nango_amocrm_chats_call",
    "displayName": "amoCRM Chats",
    "family": "amocrm",
    "hint": "amoCRM messengers and channels",
    "upstreamBase": "https://{subdomain}.amocrm.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "api/v4/talks",
        "description": "List talks"
      }
    ]
  },
  {
    "key": "amocrm-telephony",
    "tool": "nango_amocrm_telephony_call",
    "displayName": "amoCRM Telephony",
    "family": "amocrm",
    "hint": "amoCRM calls and records",
    "upstreamBase": "https://{subdomain}.amocrm.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "api/v4/events",
        "query": "filter[type]=incoming_call",
        "description": "Incoming call events"
      }
    ]
  },
  {
    "key": "amocrm-tasks",
    "tool": "nango_amocrm_tasks_call",
    "displayName": "amoCRM Tasks",
    "family": "amocrm",
    "hint": "amoCRM tasks and reminders",
    "upstreamBase": "https://{subdomain}.amocrm.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "api/v4/tasks",
        "description": "List tasks"
      }
    ]
  },
  {
    "key": "amocrm-events",
    "tool": "nango_amocrm_events_call",
    "displayName": "amoCRM Events",
    "family": "amocrm",
    "hint": "amoCRM activity history and notes",
    "upstreamBase": "https://{subdomain}.amocrm.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "api/v4/events",
        "description": "Activity feed"
      }
    ]
  },
  {
    "key": "amocrm-users",
    "tool": "nango_amocrm_users_call",
    "displayName": "amoCRM Users",
    "family": "amocrm",
    "hint": "amoCRM managers and groups",
    "upstreamBase": "https://{subdomain}.amocrm.ru",
    "aliases": [],
    "examples": [
      {
        "method": "GET",
        "endpoint": "api/v4/users",
        "description": "List users"
      }
    ]
  }
] as const;

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
  return ["nango_yandex_id_call","nango_yandex_disk_call","nango_yandex_mail_call","nango_yandex_calendar_call","nango_yandex_direct_call","nango_yandex_maps_call","nango_yandex_market_call","nango_yandex_delivery_call","nango_bitrix24_call","nango_bitrix24_crm_call","nango_bitrix24_tasks_call","nango_bitrix24_disk_call","nango_bitrix24_im_call","nango_bitrix24_user_call","nango_bitrix24_calendar_call","nango_bitrix24_bizproc_call","nango_bitrix24_telephony_call","nango_amocrm_call","nango_amocrm_crm_call","nango_amocrm_catalog_call","nango_amocrm_chats_call","nango_amocrm_telephony_call","nango_amocrm_tasks_call","nango_amocrm_events_call","nango_amocrm_users_call","nango_list_connections"];
}

export function toolNameForKey(key: string): string {
  return `nango_${key.replace(/-/g, "_")}_call`;
}

/** Human-readable tool description for the model (includes upstream + examples). */
export function buildToolDescription(meta: ProviderMeta, displayName?: string): string {
  const label = displayName || meta.displayName || meta.key;
  const lines = [
    `Call ${label} (${meta.key}) via ai-assistant-nango-proxy → Nango → provider API.`,
    meta.hint,
    meta.upstreamBase
      ? `Upstream base (Nango): ${meta.upstreamBase}. Pass endpoint as path relative to this base.`
      : "",
    "Proxy URL shape: {NANGO_PROXY_URL}/api/v1/{projectId}/evo-claws/{evoclawId}/proxy/" +
      meta.key +
      "/{endpoint}",
  ];
  if (meta.examples?.length) {
    lines.push("Examples:");
    for (const ex of meta.examples) {
      const q = ex.query ? `?${ex.query}` : "";
      const desc = ex.description ? ` — ${ex.description}` : "";
      lines.push(`- ${ex.method} ${ex.endpoint}${q}${desc}`);
    }
  }
  if (meta.notes) lines.push(`Note: ${meta.notes}`);
  if (meta.docs) lines.push(`Docs: ${meta.docs}`);
  return lines.filter(Boolean).join(" ");
}
