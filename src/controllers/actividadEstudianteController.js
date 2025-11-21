import Actividad from "../models/Actividad.js";
import mongoose from "mongoose";
import { response } from "express";

/**
 * 📚 Obtener actividades del estudiante autenticado
 * 👉 Devuelve todas las actividades activas con su docente, sin exigir vínculo con clases/cursos
 */
const obtenerActividadesEstudiante = async (req, res = response) => {
  const estudianteId = req.user?.id;
  const { materia, lapso, tipo, estado } = req.query;

  console.log("📥 Solicitud recibida para actividades del estudiante:");
  console.log("🧑‍🎓 ID del estudiante:", estudianteId);
  console.log("🎯 Filtros:", { materia, lapso, tipo, estado });

  if (!estudianteId || !mongoose.Types.ObjectId.isValid(estudianteId)) {
    console.warn("❌ Estudiante no autenticado o ID inválido:", estudianteId);
    return res
      .status(401)
      .json({ ok: false, msg: "Estudiante no autenticado." });
  }

  try {
    // 🧠 Filtros básicos (sin cursos/clases)
    const filtros = {};
    if (materia && materia !== "todos") filtros.materia = materia;
    if (lapso && lapso !== "todos") filtros.lapso = lapso;
    if (tipo && tipo !== "todos") filtros.tipo = tipo;
    filtros.estado = estado && estado !== "todos" ? estado : "activa";

    console.log("🔍 Filtros aplicados:", filtros);

    // 📚 Buscar TODAS las actividades activas y poblar docente
    const actividades = await Actividad.find(filtros)
      .select(
        "_id titulo descripcion tipo fechaEntrega ponderacion materia lapso recursos cursoId claseId docenteId estado"
      )
      .populate("docenteId", "nombre email") // ✅ siempre traer docente
      .populate("cursoId", "nombre anio seccion")
      .sort({ fechaEntrega: 1 });

    console.log("📚 Actividades encontradas:", actividades.length);

    return res.status(200).json({
      ok: true,
      actividades,
    });
  } catch (error) {
    console.error("❌ Error al obtener actividades:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al obtener actividades",
      error: error.message,
    });
  }
};

export { obtenerActividadesEstudiante };
