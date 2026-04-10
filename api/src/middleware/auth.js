const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ status: "ERROR", reason: "Nepřihlášen" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ status: "ERROR", reason: "Neplatný token" });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "ERROR", reason: "Nedostatečná oprávnění" });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
