/**
 * 🛡️ Middleware institucional para validar rol de usuario
 * Uso: verifyRole(["docente", "estudiante"])
 */
const verifyRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      console.warn("🔒 Acceso bloqueado: usuario no autenticado");
      return res.status(401).json({ ok: false, msg: "Usuario no autenticado" });
    }

    if (!user.role) {
      console.warn(`🔒 Acceso bloqueado: rol no definido para ${user.email}`);
      return res.status(403).json({ ok: false, msg: "Rol no definido" });
    }

    if (!rolesPermitidos.includes(user.role)) {
      console.warn(
        `⛔ Acceso denegado para ${user.email} → rol '${user.role}' no permitido`
      );
      return res.status(403).json({
        ok: false,
        msg: `Acceso denegado: se requiere uno de los siguientes roles → ${rolesPermitidos.join(
          ", "
        )}`,
      });
    }

    console.log(`✅ Acceso autorizado para ${user.email} como ${user.role}`);
    next();
  };
};

export default verifyRole;
