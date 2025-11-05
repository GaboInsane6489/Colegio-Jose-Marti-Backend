/**
 * 🛡️ Middleware institucional para validar rol de usuario
 * Uso: verifyRole(["docente", "estudiante"])
 */
const verifyRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const user = req.user;

    // 🧠 Validación de autenticación previa
    if (!user || typeof user !== "object") {
      console.warn(
        `🔒 Acceso bloqueado: usuario no autenticado → ${req.originalUrl}`
      );
      return res.status(401).json({
        ok: false,
        msg: "Usuario no autenticado",
        ruta: req.originalUrl,
      });
    }

    const { email = "usuario desconocido", role } = user;

    // 🧠 Validación de rol presente
    if (!role || typeof role !== "string") {
      console.warn(
        `🔒 Acceso bloqueado: rol no definido para ${email} → ${req.originalUrl}`
      );
      return res.status(403).json({
        ok: false,
        msg: "Rol no definido o inválido",
        ruta: req.originalUrl,
      });
    }

    // 🧠 Validación de rol permitido con protección defensiva
    if (!Array.isArray(rolesPermitidos)) {
      console.error(
        `❌ rolesPermitidos debe ser un array. Recibido: ${rolesPermitidos}`
      );
      return res.status(500).json({
        ok: false,
        msg: "Configuración de roles inválida en middleware",
        ruta: req.originalUrl,
      });
    }

    if (!rolesPermitidos.includes(role)) {
      console.warn(
        `⛔ Acceso denegado para ${email} → rol '${role}' no permitido en ${req.originalUrl}`
      );
      return res.status(403).json({
        ok: false,
        msg: `Acceso denegado: se requiere uno de los siguientes roles → ${rolesPermitidos.join(
          ", "
        )}`,
        ruta: req.originalUrl,
      });
    }

    // ✅ Acceso autorizado
    console.log(
      `✅ Acceso autorizado para ${email} como ${role} → ${req.originalUrl}`
    );
    next();
  };
};

export default verifyRole;
