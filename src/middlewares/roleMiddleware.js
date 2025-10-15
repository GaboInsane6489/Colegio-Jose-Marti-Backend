const verifyRole = (rolesPermitidos) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      console.warn("🔒 Solicitud sin usuario autenticado");
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const userRole = user.role;

    if (!userRole) {
      console.warn(`⚠️ Usuario sin rol definido: ${user.email}`);
      return res
        .status(401)
        .json({ message: "Rol no definido para el usuario" });
    }

    if (!rolesPermitidos.includes(userRole)) {
      console.warn(
        `🚫 Acceso denegado para ${
          user.email
        } con rol "${userRole}". Se requiere: ${rolesPermitidos.join(", ")}`
      );
      return res.status(403).json({
        message: `Acceso denegado: se requiere uno de los siguientes roles → ${rolesPermitidos.join(
          ", "
        )}`,
      });
    }

    console.log(
      `🛡️ Acceso autorizado para ${user.email} con rol "${userRole}"`
    );
    next();
  };
};

export default verifyRole;
