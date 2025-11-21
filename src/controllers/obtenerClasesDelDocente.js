import Clase from "../models/Clase.js";

/**
 * 🧑‍🏫 Devuelve las clases asignadas al docente autenticado
 * GET /api/docente/clases
 */
export const obtenerClasesDelDocente = async (req, res) => {
  try {
    const docenteId = req.user.id; // ✅ corregido

    const clases = await Clase.find({ docenteId })
      .populate("estudiantes", "nombre email")
      .populate("cursoId", "nombre anio seccion") // ✅ agregado
      .populate("docenteId", "nombre email"); // ✅ agregado

    console.log(
      `📚 Clases encontradas para docente ${docenteId}: ${clases.length}`
    );

    res.json({ ok: true, clases });
  } catch (error) {
    console.error("❌ Error al obtener clases del docente:", error.message);
    res
      .status(500)
      .json({ ok: false, msg: "Error al obtener clases del docente" });
  }
};
