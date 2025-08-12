module.exports = async function (req, res) {
  res.status(200).json({ ok: true, msg: "health v2", ts: Date.now() });
};
