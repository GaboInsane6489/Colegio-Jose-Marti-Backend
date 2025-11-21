import User from "../models/User.js";

/**
 * 📊 Controlador para obtener estadísticas institucionales en tiempo real
 * Requiere autenticación y rol "admin"
 */
export const obtenerEstadisticas = async (req, res) => {
  try {
    const usuariosRegistrados = await User.countDocuments();
    const pendientesValidacion = await User.countDocuments({
      isValidated: false,
    });
    const docentesActivos = await User.countDocuments({
      role: "docente",
      isValidated: true,
      activo: true,
    });
    const estudiantesActivos = await User.countDocuments({
      role: "estudiante",
      isValidated: true,
      activo: true,
    });
    const adminsActivos = await User.countDocuments({
      role: "admin",
      isValidated: true,
      activo: true,
    });
    const usuariosInactivos = await User.countDocuments({ activo: false });

    console.log("📊 Estadísticas institucionales:");
    console.log(`👥 Usuarios registrados: ${usuariosRegistrados}`);
    console.log(`🕒 Pendientes de validación: ${pendientesValidacion}`);
    console.log(`🧑‍🏫 Docentes activos: ${docentesActivos}`);
    console.log(`🎓 Estudiantes activos: ${estudiantesActivos}`);
    console.log(`🛡️ Administradores activos: ${adminsActivos}`);
    console.log(`🚫 Usuarios inactivos: ${usuariosInactivos}`);
    console.log(
      `🔐 Solicitado por: ${req.user?.email} (${req.user?.role}) - ID: ${req.user?.id}`
    );

    return res.status(200).json({
      ok: true,
      usuariosRegistrados,
      pendientesValidacion,
      docentesActivos,
      estudiantesActivos,
      adminsActivos,
      usuariosInactivos,
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al obtener estadísticas",
      detalle: error.message,
    });
  }
};
