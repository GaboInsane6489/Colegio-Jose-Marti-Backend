/**
 * 🛡️ Middleware institucional para validar rol de usuario
 * Uso: verifyRole(["docente", "estudiante"])
 */
const verifyRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || typeof user !== "object") {
      return res.status(401).json({
        ok: false,
        msg: "Usuario no autenticado",
        ruta: req.originalUrl,
      });
    }

    const { email = "usuario desconocido", role } = user;

    if (!role || typeof role !== "string") {
      return res.status(403).json({
        ok: false,
        msg: "Rol no definido o inválido",
        ruta: req.originalUrl,
      });
    }

    const rolNormalizado = role.toLowerCase();

    if (!Array.isArray(rolesPermitidos)) {
      return res.status(500).json({
        ok: false,
        msg: "Configuración de roles inválida en middleware",
        ruta: req.originalUrl,
      });
    }

    if (!rolesPermitidos.map((r) => r.toLowerCase()).includes(rolNormalizado)) {
      return res.status(403).json({
        ok: false,
        msg: `Acceso denegado: se requiere uno de los siguientes roles → ${rolesPermitidos.join(
          ", "
        )}`,
        ruta: req.originalUrl,
      });
    }

    next();
  };
};

export default verifyRole;
