module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const allow = process.env.ALLOW_DEV_NOAUTH || "";
  return res.status(200).json({ ALLOW_DEV_NOAUTH: allow });
};
