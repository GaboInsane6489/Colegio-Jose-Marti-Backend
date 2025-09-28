import Usuario from "../models/User.js";

export const obtenerEstadisticas = async (req, res) => {
  try {
    const usuarios = await Usuario.countDocuments();
    const pendientes = await Usuario.countDocuments({ isValidated: false });
    const docentes = await Usuario.countDocuments({
      role: "docente",
      isValidated: true,
    });

    res.json({
      usuariosRegistrados: usuarios,
      pendientesValidacion: pendientes,
      docentesActivos: docentes,
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};
