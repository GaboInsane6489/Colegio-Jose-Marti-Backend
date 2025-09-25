const verifyRole = (rolesPermitidos) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    // 🛡️ Verifica que el usuario tenga rol y esté autorizado
    if (!userRole) {
      return res.status(401).json({ message: "Usuario sin rol definido" });
    }

    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({
        message: `Acceso denegado: se requiere uno de los siguientes roles → ${rolesPermitidos.join(
          ", "
        )}`,
      });
    }

    next();
  };
};

module.exports = verifyRole;
