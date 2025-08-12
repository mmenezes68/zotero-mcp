function writeSse(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

async function fetchZotero({ apiKey, userId, groupId, opts }) {
  const base = userId
    ? `https://api.zotero.org/users/${userId}`
    : `https://api.zotero.org/groups/${groupId}`;

  const params = new URLSearchParams();
  if (opts.q) params.set("q", opts.q);
  if (opts.itemType) params.set("itemType", opts.itemType);
  params.set("limit", String(Math.min(Math.max(Number(opts.limit || 25), 1), 100)));
  params.set("start", String(Number(opts.start || 0)));
  params.set("sort", opts.sort || "dateModified");
  params.set("direction", opts.direction || "desc");

  const url = opts.collection
    ? `${base}/collections/${opts.collection}/items?${params.toString()}`
    : `${base}/items?${params.toString()}`;

  const r = await fetch(url, { headers: { "Zotero-API-Key": apiKey } });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Zotero error ${r.status}: ${text}`);
  }
  return r.json();
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const apiKey = process.env.ZOTERO_API_KEY;
  const userId = process.env.ZOTERO_USER_ID;
  const groupId = process.env.ZOTERO_GROUP_ID;

  if (!apiKey || (!userId && !groupId)) {
    writeSse(res, { type: "error", error: "Faltam variáveis de ambiente: ZOTERO_API_KEY e (ZOTERO_USER_ID ou ZOTERO_GROUP_ID)." });
    return res.end();
  }

  writeSse(res, { type: "ready", message: "Zotero MCP SSE online" });

  const action = (req.query.action || "listItems").toString();

  try {
    if (action === "listItems") {
      const opts = {
        q: req.query.q?.toString(),
        itemType: req.query.itemType?.toString(),
        collection: req.query.collection?.toString(),
        limit: req.query.limit?.toString(),
        start: req.query.start?.toString(),
        sort: req.query.sort?.toString(),
        direction: req.query.direction?.toString(),
      };

      const data = await fetchZotero({ apiKey, userId, groupId, opts });

      const items = (Array.isArray(data) ? data : []).map((it) => {
        const d = it.data || {};
        const creators = Array.isArray(d.creators) ? d.creators : [];
        const creatorsFmt = creators
          .map((c) => (c.name ? c.name : `${c.firstName || ""} ${c.lastName || ""}`.trim()))
          .filter(Boolean)
          .join("; ");
        const tags = Array.isArray(d.tags) ? d.tags.map((t) => t.tag).join("; ") : "";
        return {
          key: it.key,
          itemType: d.itemType,
          title: d.title,
          date: d.date,
          creators: creatorsFmt,
          publicationTitle: d.publicationTitle,
          DOI: d.DOI,
          url: d.url,
          language: d.language,
          dateAdded: d.dateAdded,
          dateModified: d.dateModified,
          tags,
        };
      });

      writeSse(res, { type: "items", count: items.length, items });
      writeSse(res, { type: "done" });
      return res.end();
    }

    writeSse(res, { type: "error", error: `Action desconhecida: ${action}` });
    res.end();
  } catch (err) {
    writeSse(res, { type: "error", error: String(err?.message || err) });
    res.end();
  }
}
