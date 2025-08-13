const fs = require("fs");
const path = require("path");
const url = require("url");

module.exports = (req, res) => {
  const { pathname } = url.parse(req.url, true);

  if (pathname === "/api" || pathname === "/api/") {
    return res.status(200).json({
      ok: true,
      endpoints: [
        "/api/health",
        "/api/hello",
        "/api/openapi",
        "/openapi.yaml",
        "/api/sse?action=listItems&limit=5"
      ]
    });
  }

  if (pathname === "/api/health") {
    return res.status(200).json({ ok: true, ts: Date.now() });
  }

  if (pathname === "/api/hello") {
    return res.status(200).json({ ok: true, route: "/api/hello", ts: Date.now() });
  }

  if (pathname === "/api/openapi") {
    try {
      const p = path.join(process.cwd(), "public", "openapi.yaml");
      const text = fs.readFileSync(p, "utf8");
      res.setHeader("Content-Type", "text/yaml; charset=utf-8");
      return res.status(200).send(text);
    } catch (err) {
      return res.status(500).send("Failed to load openapi.yaml");
    }
  }

  return res.status(404).send("NOT_FOUND");
};
