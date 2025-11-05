import Usuario from "../models/User.js";

/**
 * 📊 Controlador para obtener estadísticas institucionales en tiempo real
 * Requiere autenticación y rol "admin"
 */
export const obtenerEstadisticas = async (req, res) => {
  try {
    const usuariosRegistrados = await Usuario.countDocuments();
    const pendientesValidacion = await Usuario.countDocuments({
      isValidated: false,
    });
    const docentesActivos = await Usuario.countDocuments({
      role: "docente",
      isValidated: true,
    });

    console.log("📊 Estadísticas institucionales:");
    console.log(`👥 Usuarios registrados: ${usuariosRegistrados}`);
    console.log(`🕒 Pendientes de validación: ${pendientesValidacion}`);
    console.log(`🧑‍🏫 Docentes activos: ${docentesActivos}`);
    console.log(`🔐 Solicitado por: ${req.user?.email} (${req.user?.role})`);

    return res.status(200).json({
      ok: true,
      usuariosRegistrados,
      pendientesValidacion,
      docentesActivos,
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
