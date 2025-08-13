const url = require('url');

module.exports = async (req, res) => {
  try {
    const { query } = url.parse(req.url, true);
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 5;

    // chama a própria API /api/sse com action=listItems
    const base = (req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host;
    const endpoint = `${base}/api/sse?action=listItems&limit=${limit}`;

    const r = await fetch(endpoint);
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).send(text || 'Upstream error');
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ ok:false, error: String(err) });
  }
};
