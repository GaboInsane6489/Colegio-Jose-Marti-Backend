import jwt from "jsonwebtoken";

/**
 * 🔐 Middleware institucional para verificar token JWT
 * Inyecta req.user con { userId, email, role, isValidated }
 * Responde con 401 si no hay token, 403 si es inválido, 500 si falta JWT_SECRET
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    console.warn("🔒 Solicitud sin token");
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET no definido en el entorno");
    return res.status(500).json({ message: "Error interno de configuración" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧠 Inyección institucional de usuario
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isValidated: decoded.isValidated,
    };

    console.log(`✅ Token verificado: ${decoded.email} (${decoded.role})`);
    next();
  } catch (error) {
    console.error("❌ Token inválido o expirado:", error.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

export default verifyToken;
