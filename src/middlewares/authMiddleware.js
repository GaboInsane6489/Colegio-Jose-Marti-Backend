const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "🔒 Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId, // ✅ corregido
      email: decoded.email,
      role: decoded.role,
      isValidated: decoded.isValidated,
    };

    next();
  } catch (error) {
    console.error("❌ Error al verificar token:", error);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

module.exports = verifyToken;
