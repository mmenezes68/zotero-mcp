module.exports = async function (req, res) {
  res.status(200).json({ ok: true, msg: "health", ts: Date.now() });
};
