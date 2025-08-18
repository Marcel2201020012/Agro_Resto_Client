export default function handler(req, res) {
  const { token } = req.query;
  if (token === process.env.SECRET_TOKEN) {
    res.status(200).json({ access: true });
  } else {
    res.status(403).json({ access: false });
  }
}