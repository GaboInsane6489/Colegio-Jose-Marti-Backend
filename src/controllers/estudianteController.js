import Clase from "../models/Clase.js";
import Actividad from "../models/Actividad.js";
import EntregaActividad from "../models/EntregaActividad.js";
import Curso from "../models/Curso.js";

// 📚 Obtener clases activas del estudiante
export const obtenerClases = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    console.log("📌 ID del estudiante:", estudianteId);

    const clases = await Clase.find({ estudiantes: estudianteId }).populate(
      "curso"
    );
    console.log("📚 Clases encontradas:", clases.length);

    res.json({ clases });
  } catch (error) {
    console.error("❌ Error al obtener clases:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener clases del estudiante." });
  }
};

// 📋 Obtener actividades asignadas por docentes
export const obtenerActividadesEstudiante = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    console.log("📌 ID del estudiante:", estudianteId);

    // Buscar cursos donde el estudiante está inscrito
    const clases = await Clase.find({ estudiantes: estudianteId }).select(
      "curso"
    );
    const cursoIds = clases.map((c) => c.curso);
    console.log("📦 Cursos activos:", cursoIds.length);

    if (cursoIds.length === 0) {
      console.log("⚠️ El estudiante no tiene cursos asignados.");
      return res.status(200).json({ actividades: [] });
    }

    const actividades = await Actividad.find({
      cursoId: { $in: cursoIds },
      estado: "activa",
    })
      .sort({ fechaEntrega: 1 })
      .populate("docenteId", "nombre");

    console.log("📝 Actividades encontradas:", actividades.length);

    const limpias = actividades.filter(
      (a) =>
        a &&
        typeof a === "object" &&
        a.titulo &&
        a.materia &&
        a.fechaEntrega &&
        a.lapso
    );

    res.json({ actividades: limpias });
  } catch (error) {
    console.error("❌ Error al obtener actividades:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener actividades asignadas." });
  }
};

// 📦 Obtener entregas del estudiante
export const obtenerEntregasEstudiante = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    console.log("📌 ID del estudiante:", estudianteId);

    const entregas = await EntregaActividad.find({ estudianteId })
      .populate("actividad", "titulo fechaEntrega materia lapso")
      .sort({ fechaEntrega: -1 });

    console.log("📦 Entregas encontradas:", entregas.length);

    res.json({ entregas });
  } catch (error) {
    console.error("❌ Error al obtener entregas:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener entregas del estudiante." });
  }
};
