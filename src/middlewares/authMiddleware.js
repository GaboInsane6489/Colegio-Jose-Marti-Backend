import jwt from "jsonwebtoken";

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
    console.error("❌ JWT_SECRET no está definido en el entorno");
    return res.status(500).json({ message: "Error interno de configuración" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isValidated: decoded.isValidated,
    };

    console.log(`✅ Token verificado para: ${decoded.email} (${decoded.role})`);
    next();
  } catch (error) {
    console.error("❌ Token inválido o expirado:", error.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

export default verifyToken;
