import Clase from "../models/Clase.js";
import Actividad from "../models/Actividad.js";
import EntregaActividad from "../models/EntregaActividad.js";
import Curso from "../models/Curso.js";

// 📚 Obtener clases activas del estudiante
export const obtenerClases = async (req, res) => {
  try {
    const estudianteId = req.user.id;

    const clases = await Clase.find({ estudiantes: estudianteId }).populate(
      "curso"
    );

    res.json({ clases });
  } catch (error) {
    console.error("❌ Error al obtener clases:", error);
    res.status(500).json({ message: "Error interno al obtener clases" });
  }
};

// 📋 Obtener actividades asignadas por docentes
export const obtenerActividadesEstudiante = async (req, res) => {
  try {
    const estudianteId = req.user.id;

    // Buscar cursos donde el estudiante está inscrito
    const clases = await Clase.find({ estudiantes: estudianteId }).select(
      "curso"
    );
    const cursoIds = clases.map((c) => c.curso);

    if (cursoIds.length === 0) {
      return res.status(200).json({ actividades: [] });
    }

    const actividades = await Actividad.find({
      cursoId: { $in: cursoIds },
      estado: "activa",
    })
      .sort({ fechaEntrega: 1 })
      .populate("docenteId", "nombre");

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
    res.status(500).json({ message: "Error interno al obtener actividades" });
  }
};

// 📦 Obtener entregas del estudiante
export const obtenerEntregasEstudiante = async (req, res) => {
  try {
    const estudianteId = req.user.id;

    const entregas = await EntregaActividad.find({ estudianteId })
      .populate("actividad", "titulo fechaEntrega materia lapso")
      .sort({ fechaEntrega: -1 });

    res.json({ entregas });
  } catch (error) {
    console.error("❌ Error al obtener entregas:", error);
    res.status(500).json({ message: "Error interno al obtener entregas" });
  }
};
