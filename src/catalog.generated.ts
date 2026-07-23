/* AUTO-GENERATED from catalog/providers.yaml — do not edit by hand.
 * Run: npm run generate
 */
export type ProviderExample = {
  method: string;
  endpoint: string;
  query?: string;
  description?: string;
};

export type ProviderTool = {
  name: string;
  action: string;
  description: string;
};

export type ProviderMeta = {
  key: string;
  /** First tool name (compat). */
  tool: string;
  tools: ProviderTool[];
  /** "proxy" | "mail" | "disk" | "calendar" */
  kind: "proxy" | "mail" | "disk" | "calendar" | string;
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
    "tools": [
      {
        "name": "nango_yandex_id_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tool": "nango_yandex_disk_info",
    "tools": [
      {
        "name": "nango_yandex_disk_info",
        "action": "info",
        "description": "Disk quota and meta (GET /v1/disk)"
      },
      {
        "name": "nango_yandex_disk_list",
        "action": "list",
        "description": "List folder resources (GET /v1/disk/resources?path=)"
      },
      {
        "name": "nango_yandex_disk_get",
        "action": "get",
        "description": "Get file/folder meta (GET /v1/disk/resources?path=)"
      },
      {
        "name": "nango_yandex_disk_files",
        "action": "files",
        "description": "Flat list of all files (GET /v1/disk/resources/files)"
      },
      {
        "name": "nango_yandex_disk_last_uploaded",
        "action": "last_uploaded",
        "description": "Recently uploaded files"
      },
      {
        "name": "nango_yandex_disk_mkdir",
        "action": "mkdir",
        "description": "Create folder (PUT /v1/disk/resources?path=)"
      },
      {
        "name": "nango_yandex_disk_upload",
        "action": "upload",
        "description": "Upload a local file to Yandex Disk (gets upload URL then PUT bytes). Pass destination path (must start with /) and localPath on the EvoClaw host.\n"
      },
      {
        "name": "nango_yandex_disk_upload_link",
        "action": "upload_link",
        "description": "Get one-shot upload URL only (GET /v1/disk/resources/upload?path=). Prefer nango_yandex_disk_upload for full upload. path must start with /.\n"
      },
      {
        "name": "nango_yandex_disk_download_link",
        "action": "download_link",
        "description": "Get download URL (GET /v1/disk/resources/download?path=). path must start with /."
      },
      {
        "name": "nango_yandex_disk_copy",
        "action": "copy",
        "description": "Copy resource (POST /v1/disk/resources/copy)"
      },
      {
        "name": "nango_yandex_disk_move",
        "action": "move",
        "description": "Move/rename resource (POST /v1/disk/resources/move)"
      },
      {
        "name": "nango_yandex_disk_delete",
        "action": "delete",
        "description": "Delete to trash or permanently (DELETE /v1/disk/resources)"
      },
      {
        "name": "nango_yandex_disk_publish",
        "action": "publish",
        "description": "Publish resource (PUT …/publish)"
      },
      {
        "name": "nango_yandex_disk_unpublish",
        "action": "unpublish",
        "description": "Unpublish resource (PUT …/unpublish)"
      },
      {
        "name": "nango_yandex_disk_trash_list",
        "action": "trash_list",
        "description": "List trash (GET /v1/disk/trash/resources)"
      },
      {
        "name": "nango_yandex_disk_trash_restore",
        "action": "trash_restore",
        "description": "Restore from trash (PUT …/trash/resources/restore)"
      },
      {
        "name": "nango_yandex_disk_trash_empty",
        "action": "trash_empty",
        "description": "Empty trash (DELETE /v1/disk/trash/resources)"
      }
    ],
    "kind": "disk",
    "displayName": "Yandex Disk",
    "family": "yandex",
    "hint": "Full Yandex Disk CRUD via REST (cloud-api.yandex.net)",
    "upstreamBase": "https://cloud-api.yandex.net",
    "aliases": [],
    "docs": "https://yandex.com/dev/disk/api/concepts/about.html",
    "notes": "Connecting yandex-disk enables dedicated tools (info/list/get/mkdir/upload/upload_link/download_link/copy/move/delete/publish/unpublish/trash_*). Calls go through Nango proxy to Disk REST API with OAuth. All Disk paths must be absolute and start with / (e.g. /folder/file.pdf). Prefer upload over upload_link.\n",
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
        "description": "List root"
      },
      {
        "method": "PUT",
        "endpoint": "v1/disk/resources",
        "query": "path=/folder",
        "description": "Create folder"
      },
      {
        "method": "DELETE",
        "endpoint": "v1/disk/resources",
        "query": "path=/file.txt",
        "description": "Move to trash"
      }
    ]
  },
  {
    "key": "yandex-mail",
    "tool": "nango_yandex_mail_list",
    "tools": [
      {
        "name": "nango_yandex_mail_list",
        "action": "list",
        "description": "List recent messages in a mailbox (default INBOX)"
      },
      {
        "name": "nango_yandex_mail_get",
        "action": "get",
        "description": "Get a message body by IMAP UID"
      },
      {
        "name": "nango_yandex_mail_send",
        "action": "send",
        "description": "Send an email via SMTP XOAUTH2"
      }
    ],
    "kind": "mail",
    "displayName": "Yandex Mail",
    "family": "yandex",
    "hint": "Read and send Yandex Mail via IMAP/SMTP XOAUTH2 (mail API on nango-proxy)",
    "upstreamBase": "imap.yandex.com / smtp.yandex.com (via /mail/*)",
    "aliases": [],
    "notes": "Not REST. Connecting yandex-mail enables nango_yandex_mail_list|get|send. Proxy routes: GET /mail/list, GET /mail/get?uid=, POST /mail/send. User must enable in Yandex Mail → Settings → Email clients: \"From the imap.yandex.com server via IMAP\" and \"App passwords and OAuth tokens\". Then reconnect yandex-mail if IMAP was disabled at connect time.\n",
    "examples": [
      {
        "method": "GET",
        "endpoint": "mail/list",
        "query": "limit=20",
        "description": "List latest 20 messages"
      },
      {
        "method": "GET",
        "endpoint": "mail/get",
        "query": "uid=123",
        "description": "Read message by UID"
      },
      {
        "method": "POST",
        "endpoint": "mail/send",
        "description": "Send email (JSON body to/subject/body)"
      }
    ]
  },
  {
    "key": "yandex-calendar",
    "tool": "nango_yandex_calendar_list_calendars",
    "tools": [
      {
        "name": "nango_yandex_calendar_list_calendars",
        "action": "list_calendars",
        "description": "List user calendars (CalDAV PROPFIND). Returns href + displayName."
      },
      {
        "name": "nango_yandex_calendar_create_calendar",
        "action": "create_calendar",
        "description": "Create a new calendar (CalDAV MKCALENDAR). Body {displayName, id?}."
      },
      {
        "name": "nango_yandex_calendar_list_events",
        "action": "list_events",
        "description": "List events in a time range (CalDAV REPORT). calendar = displayName or href."
      },
      {
        "name": "nango_yandex_calendar_get_event",
        "action": "get_event",
        "description": "Get one event by href (.ics)"
      },
      {
        "name": "nango_yandex_calendar_create_event",
        "action": "create_event",
        "description": "Create event (CalDAV PUT .ics). calendar = displayName or href (default events-default)."
      },
      {
        "name": "nango_yandex_calendar_update_event",
        "action": "update_event",
        "description": "Update event by uid (CalDAV PUT .ics)"
      },
      {
        "name": "nango_yandex_calendar_delete_event",
        "action": "delete_event",
        "description": "Delete event by href (CalDAV DELETE)"
      }
    ],
    "kind": "calendar",
    "displayName": "Yandex Calendar",
    "family": "yandex",
    "hint": "Full Yandex Calendar CRUD via CalDAV (caldav.yandex.ru + OAuth)",
    "upstreamBase": "caldav.yandex.ru (via /calendar/*)",
    "aliases": [],
    "notes": "Not plain REST. Connecting yandex-calendar enables nango_yandex_calendar_list_calendars|create_calendar|list_events|get_event|create_event|update_event|delete_event. Proxy routes under /calendar/* speak CalDAV with OAuth token (scope calendar:all). For events, pass calendar as displayName from list_calendars (e.g. «Мои события») or href (/calendars/user@yandex.ru/events-default/) — never invent a path from the title.\n",
    "examples": [
      {
        "method": "GET",
        "endpoint": "calendar/calendars",
        "description": "List calendars"
      },
      {
        "method": "GET",
        "endpoint": "calendar/events",
        "query": "start=2026-07-01&end=2026-08-01",
        "description": "List events"
      },
      {
        "method": "POST",
        "endpoint": "calendar/events",
        "description": "Create event JSON {summary,start,end,…}"
      }
    ]
  },
  {
    "key": "yandex-direct",
    "tool": "nango_yandex_direct_call",
    "tools": [
      {
        "name": "nango_yandex_direct_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_yandex_maps_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_yandex_market_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_yandex_delivery_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_bitrix24_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_bitrix24_crm_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_bitrix24_tasks_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_bitrix24_disk_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_bitrix24_im_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_bitrix24_user_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_bitrix24_calendar_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_bitrix24_bizproc_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_bitrix24_telephony_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_amocrm_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_amocrm_crm_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_amocrm_catalog_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_amocrm_chats_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_amocrm_telephony_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_amocrm_tasks_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_amocrm_events_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
    "tools": [
      {
        "name": "nango_amocrm_users_call",
        "action": "call",
        "description": ""
      }
    ],
    "kind": "proxy",
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
  CATALOG.flatMap((p) => p.tools.map((t) => [t.name, p] as [string, ProviderMeta])),
);

export const LIST_CONNECTIONS_TOOL = "nango_list_connections";

export function allContractTools(): string[] {
  return ["nango_yandex_id_call","nango_yandex_disk_info","nango_yandex_disk_list","nango_yandex_disk_get","nango_yandex_disk_files","nango_yandex_disk_last_uploaded","nango_yandex_disk_mkdir","nango_yandex_disk_upload","nango_yandex_disk_upload_link","nango_yandex_disk_download_link","nango_yandex_disk_copy","nango_yandex_disk_move","nango_yandex_disk_delete","nango_yandex_disk_publish","nango_yandex_disk_unpublish","nango_yandex_disk_trash_list","nango_yandex_disk_trash_restore","nango_yandex_disk_trash_empty","nango_yandex_mail_list","nango_yandex_mail_get","nango_yandex_mail_send","nango_yandex_calendar_list_calendars","nango_yandex_calendar_create_calendar","nango_yandex_calendar_list_events","nango_yandex_calendar_get_event","nango_yandex_calendar_create_event","nango_yandex_calendar_update_event","nango_yandex_calendar_delete_event","nango_yandex_direct_call","nango_yandex_maps_call","nango_yandex_market_call","nango_yandex_delivery_call","nango_bitrix24_call","nango_bitrix24_crm_call","nango_bitrix24_tasks_call","nango_bitrix24_disk_call","nango_bitrix24_im_call","nango_bitrix24_user_call","nango_bitrix24_calendar_call","nango_bitrix24_bizproc_call","nango_bitrix24_telephony_call","nango_amocrm_call","nango_amocrm_crm_call","nango_amocrm_catalog_call","nango_amocrm_chats_call","nango_amocrm_telephony_call","nango_amocrm_tasks_call","nango_amocrm_events_call","nango_amocrm_users_call","nango_list_connections"];
}

export function toolNameForKey(key: string): string {
  return `nango_${key.replace(/-/g, "_")}_call`;
}

/** Human-readable tool description for the model (includes upstream + examples). */
export function buildToolDescription(meta: ProviderMeta, displayName?: string, toolName?: string): string {
  const label = displayName || meta.displayName || meta.key;
  if (meta.kind === "mail") {
    const action = meta.tools.find((t) => t.name === toolName)?.action || "mail";
    const actionHint = meta.tools.find((t) => t.name === toolName)?.description || "";
    const lines = [
      `${label} (${meta.key}) — ${action}: ${actionHint}`.trim(),
      meta.hint,
      "Uses ai-assistant-nango-proxy mail API (IMAP/SMTP XOAUTH2). Tokens stay in Nango.",
      "Routes: GET /mail/list, GET /mail/get?uid=, POST /mail/send",
    ];
    if (meta.notes) lines.push(`Note: ${meta.notes}`);
    return lines.filter(Boolean).join(" ");
  }
  if (meta.kind === "disk") {
    const actionHint = meta.tools.find((t) => t.name === toolName)?.description || "";
    const lines = [
      `${label} (${meta.key}) — ${actionHint}`.trim(),
      meta.hint,
      "Yandex Disk REST via Nango proxy (cloud-api.yandex.net). Full CRUD.",
    ];
    if (meta.notes) lines.push(`Note: ${meta.notes}`);
    if (meta.docs) lines.push(`Docs: ${meta.docs}`);
    return lines.filter(Boolean).join(" ");
  }
  if (meta.kind === "calendar") {
    const actionHint = meta.tools.find((t) => t.name === toolName)?.description || "";
    const lines = [
      `${label} (${meta.key}) — ${actionHint}`.trim(),
      meta.hint,
      "Uses ai-assistant-nango-proxy calendar API (CalDAV + OAuth). Tokens stay in Nango.",
      "Routes: GET|POST /calendar/calendars, GET|POST|PUT /calendar/events, GET|DELETE /calendar/event",
    ];
    if (meta.notes) lines.push(`Note: ${meta.notes}`);
    return lines.filter(Boolean).join(" ");
  }
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
