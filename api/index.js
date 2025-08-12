module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    endpoints: ["/api/health", "/api/hello", "/api/sse?action=listItems&limit=5"]
  });
};
