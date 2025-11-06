import Clase from "../models/Clase.js";
import Actividad from "../models/Actividad.js";
import EntregaActividad from "../models/EntregaActividad.js";
import Curso from "../models/Curso.js";

// 📚 Obtener clases activas del estudiante
export const obtenerClases = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    console.log("📌 ID del estudiante:", estudianteId);

    const clases = await Clase.find({ estudiantes: estudianteId })
      .populate("docenteId", "nombre email") // 👨‍🏫 Docente simplificado
      .populate("estudiantes", "nombre email") // 👥 Compañeros (opcional)
      .sort({ nombre: 1 });

    console.log("📚 Clases encontradas:", clases.length);

    res.json({ clases });
  } catch (error) {
    console.error("❌ Error al obtener clases:", error);
    res.status(500).json({
      message: "Error interno al obtener clases del estudiante.",
    });
  }
};

// 📋 Obtener actividades asignadas por docentes (modo legacy por curso)
export const obtenerActividadesEstudiante = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    console.log("📌 ID del estudiante:", estudianteId);

    const clases = await Clase.find({ estudiantes: estudianteId }).select(
      "curso"
    );
    const cursoIds = clases.map((c) => c.curso);

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
    res.status(500).json({
      message: "Error interno al obtener actividades asignadas.",
    });
  }
};

// 📘 Obtener actividades filtradas por claseIds (modo nuevo)
export const obtenerActividadesPorClases = async (req, res) => {
  try {
    const { claseIds } = req.body;

    if (!Array.isArray(claseIds) || claseIds.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "No se proporcionaron clases válidas.",
      });
    }

    const actividades = await Actividad.find({
      claseId: { $in: claseIds },
      estado: "activa",
    })
      .sort({ fechaEntrega: 1 })
      .populate("docenteId", "nombre email");

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
    console.error("❌ Error al obtener actividades por clases:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno al obtener actividades por clases.",
      error: error.message,
    });
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
    res.status(500).json({
      message: "Error interno al obtener entregas del estudiante.",
    });
  }
};
