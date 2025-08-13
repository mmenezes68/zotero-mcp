// Handler em CommonJS para @vercel/node
module.exports = async (req, res) => {
  // Parse seguro da query
  const url = new URL(req.url, `http://${req.headers.host}`);
  const action = url.searchParams.get("action") || "";
  const limit = parseInt(url.searchParams.get("limit") || "5", 10);

  try {
    if (action !== "listItems") {
      return res.status(400).json({ ok: false, error: `Ação inválida: ${action}` });
    }

    // Se não houver env local, devolve dados fake (modo stub) — bom p/ teste local
    const API_KEY = process.env.ZOTERO_API_KEY;
    const USER_ID = process.env.ZOTERO_USER_ID;
    if (!API_KEY || !USER_ID) {
      const fake = Array.from({ length: Math.max(1, Math.min(limit, 10)) }, (_, i) => ({
        key: `FAKE_${i + 1}`,
        title: `Item de teste #${i + 1}`,
        creators: "Autor Exemplo"
      }));
      return res.status(200).json({ ok: true, mode: "stub", items: fake });
    }

    // Chamada real ao Zotero (quando variáveis estiverem definidas no ambiente)
    const endpoint = `https://api.zotero.org/users/${USER_ID}/items?limit=${limit}`;
    const r = await fetch(endpoint, { headers: { "Zotero-API-Key": API_KEY } });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`Zotero error ${r.status}: ${text}`);
    }
    const items = await r.json();

    const formatted = (items || []).map((item) => ({
      key: item.key,
      title: (item?.data?.title || "Sem título"),
      creators: (item?.data?.creators || [])
        .map((c) => (c.name ? c.name : `${c.firstName || ""} ${c.lastName || ""}`.trim()))
        .join(", ")
    }));

    return res.status(200).json({ ok: true, mode: "zotero", items: formatted });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err && err.message || err) });
  }
};
