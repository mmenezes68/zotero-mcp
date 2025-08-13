module.exports = (req, res) => {
  const path = req.url.split("?")[0];

  if (path === "/api") {
    return res.status(200).json({
      ok: true,
      endpoints: ["/api/health", "/api/hello", "/api/sse?action=listItems&limit=5"]
    });
  }

  if (path === "/api/health") {
    return res.status(200).json({ ok: true, ts: Date.now() });
  }

  if (path === "/api/hello") {
    return res.status(200).json({ ok: true, route: "/api/hello", ts: Date.now() });
  }

  res.status(404).send("NOT_FOUND");
};
