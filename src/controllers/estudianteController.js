import Clase from "../models/Clase.js";

// 📚 Obtener clases activas del estudiante
export const obtenerClases = async (req, res) => {
  try {
    const estudianteId = req.user.id;

    const clases = await Clase.find({ estudiantes: estudianteId });

    res.json({ clases });
  } catch (error) {
    console.error("❌ Error al obtener clases:", error);
    res.status(500).json({ message: "Error interno al obtener clases" });
  }
};
