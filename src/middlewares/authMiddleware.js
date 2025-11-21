import jwt from "jsonwebtoken";

/**
 * 🔐 Middleware institucional para verificar token JWT
 * Inyecta req.user con { id, email, role, isValidated }
 * Responde con:
 * - 401 si no hay token
 * - 403 si es inválido o sin id válido
 * - 500 si falta JWT_SECRET
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    console.warn("🔒 Solicitud sin token en:", req.originalUrl);
    return res.status(401).json({
      ok: false,
      msg: "Token no proporcionado",
      ruta: req.originalUrl,
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET no definido en el entorno");
    return res.status(500).json({
      ok: false,
      msg: "Error interno de configuración JWT",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧠 Log estratégico para trazabilidad
    console.log("📦 Token decodificado:", decoded);

    // 🧠 Inyección institucional de usuario
    const userId =
      decoded.id ?? decoded.userId ?? decoded._id ?? decoded.sub ?? null;

    if (!userId || !/^[a-f\d]{24}$/i.test(userId)) {
      console.warn("⚠️ id inválido en token:", decoded);
      return res.status(403).json({
        ok: false,
        msg: "Token inválido: id no válido",
      });
    }

    req.user = {
      id: userId,
      email: decoded.email,
      role: decoded.role,
      isValidated: decoded.isValidated,
    };

    console.log(
      `✅ Token verificado: ${req.user.email} (${req.user.role}) → ${req.originalUrl}`
    );
    next();
  } catch (error) {
    console.error("❌ Token inválido o expirado:", error.message);
    return res.status(403).json({
      ok: false,
      msg: "Token inválido o expirado",
      detalle: error.message,
    });
  }
};

export default verifyToken;
