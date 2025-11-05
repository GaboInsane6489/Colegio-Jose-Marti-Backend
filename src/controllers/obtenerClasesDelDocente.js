import Clase from "../models/Clase.js";

export const obtenerClasesDelDocente = async (req, res) => {
  try {
    const docenteId = req.usuario.id;

    const clases = await Clase.find({ docente: docenteId }).populate(
      "estudiantes",
      "nombre email"
    );

    res.json({ clases });
  } catch (error) {
    console.error("❌ Error al obtener clases del docente:", error);
    res.status(500).json({ message: "Error al obtener clases del docente" });
  }
};
