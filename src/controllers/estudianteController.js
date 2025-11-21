import mongoose from "mongoose";
import Clase from "../models/Clase.js";
import Actividad from "../models/Actividad.js";
import EntregaActividad from "../models/EntregaActividad.js";
import Curso from "../models/Curso.js";

// 🎓 Obtener clases activas del estudiante
export const obtenerClases = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    console.log("ID del estudiante:", estudianteId);

    const clases = await Clase.find({ estudiantes: estudianteId })
      .populate("docenteId", "nombre email")
      .populate("estudiantes", "nombre email")
      .populate("cursoId", "nombre anio seccion")
      .sort({ nombre: 1 });

    console.log("Clases encontradas:", clases.length);

    res.json({ clases });
  } catch (error) {
    console.error("Error al obtener clases:", error.message);
    res.status(500).json({
      message: "Error interno al obtener clases del estudiante.",
    });
  }
};

// 📚 Obtener todas las actividades activas (sin depender de cursos/clases)
export const obtenerActividadesEstudiante = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    console.log("ID del estudiante:", estudianteId);

    // 🧠 Buscar TODAS las actividades activas
    const actividades = await Actividad.find({ estado: "activa" })
      .select(
        "_id titulo descripcion tipo fechaEntrega ponderacion materia lapso recursos cursoId claseId estado"
      )
      .sort({ fechaEntrega: 1 })
      .populate("docenteId", "nombre email")
      .populate("cursoId", "nombre anio seccion");

    console.log("Actividades encontradas:", actividades.length);

    res.json({ actividades });
  } catch (error) {
    console.error("Error al obtener actividades:", error.message);
    res.status(500).json({
      message: "Error interno al obtener actividades asignadas.",
    });
  }
};

// 📦 Obtener todas las entregas del estudiante
export const obtenerEntregasEstudiante = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    console.log("ID del estudiante:", estudianteId);

    const entregas = await EntregaActividad.find({ estudianteId })
      .populate("actividadId", "titulo fechaEntrega materia lapso")
      .sort({ fechaEntrega: -1 });

    console.log("Entregas encontradas:", entregas.length);

    res.json({ entregas });
  } catch (error) {
    console.error("Error al obtener entregas:", error.message);
    res.status(500).json({
      message: "Error interno al obtener entregas del estudiante.",
    });
  }
};

// 📘 Obtener una entrega específica del estudiante por actividadId
export const obtenerEntregaPorId = async (req, res) => {
  try {
    const estudianteId = req.user.id;
    const actividadIdRaw = req.params.id;

    console.log("ID del estudiante:", estudianteId);
    console.log("ID de la actividad:", actividadIdRaw);

    let actividadId;
    try {
      actividadId = new mongoose.Types.ObjectId(actividadIdRaw);
    } catch (conversionError) {
      console.error("ID de actividad inválido:", conversionError.message);
      return res.status(400).json({ error: "ID de actividad no válido." });
    }

    const entrega = await EntregaActividad.findOne({
      actividadId,
      estudianteId,
    }).populate("actividadId", "titulo fechaEntrega materia lapso");

    if (!entrega) {
      return res.status(404).json({ error: "Entrega no encontrada" });
    }

    res.json({ entrega });
  } catch (error) {
    console.error("Error al obtener entrega:", error.message);
    res.status(500).json({
      message: "Error interno al obtener entrega del estudiante.",
    });
  }
};
