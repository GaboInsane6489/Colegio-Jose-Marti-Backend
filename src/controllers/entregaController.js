import EntregaActividad from "../models/EntregaActividad.js";
import Notificacion from "../models/Notificacion.js";
import Actividad from "../models/Actividad.js";
import Clase from "../models/Clase.js";
import { response } from "express";

// 📌 Registrar entrega de estudiante
export const registrarEntrega = async (req, res = response) => {
  const { actividadId, archivoUrl } = req.body;
  const estudianteId = req.user?.id; // ✅ corregido

  if (!actividadId || !estudianteId) {
    return res.status(400).json({
      ok: false,
      msg: "Faltan datos obligatorios: actividadId o estudianteId",
    });
  }

  try {
    // 🧠 Buscar la actividad para extraer cursoId y claseId
    const actividad = await Actividad.findById(actividadId).select(
      "cursoId claseId fechaEntrega"
    );
    if (!actividad) {
      return res
        .status(404)
        .json({ ok: false, msg: "Actividad no encontrada" });
    }

    // 🔒 Validar que el estudiante esté asignado a la clase
    const clase = await Clase.findById(actividad.claseId).select("estudiantes");
    const asignado = clase?.estudiantes?.some((id) => id.equals(estudianteId));
    if (!asignado) {
      return res.status(403).json({
        ok: false,
        msg: "No estás asignado a esta clase. No puedes entregar esta actividad.",
      });
    }

    // ⏳ Determinar estado según fecha de entrega
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const estadoEntrega =
      actividad.fechaEntrega >= hoy ? "entregado" : "vencido";

    const nuevaEntrega = new EntregaActividad({
      actividadId,
      claseId: actividad.claseId,
      cursoId: actividad.cursoId,
      estudianteId,
      archivoUrl,
      fechaEntrega: new Date(),
      estado: estadoEntrega,
    });

    await nuevaEntrega.save();

    res.status(201).json({
      ok: true,
      msg: "Entrega registrada correctamente",
      entrega: nuevaEntrega,
    });
  } catch (error) {
    console.error("❌ Error al registrar entrega:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al registrar entrega",
      error: error.message,
    });
  }
};

// 📋 Listar entregas por actividad
export const listarEntregasPorActividad = async (req, res = response) => {
  const { actividadId } = req.params;

  if (!actividadId) {
    return res.status(400).json({ ok: false, msg: "actividadId es requerido" });
  }

  try {
    const entregas = await EntregaActividad.find({ actividadId })
      .populate("estudianteId", "nombre email") // ✅ corregido
      .sort({ fechaEntrega: 1 });

    res.json({
      ok: true,
      entregas,
    });
  } catch (error) {
    console.error("❌ Error al listar entregas:", error.message);
    res.status(500).json({
      ok: false,
      msg: "No se pudieron obtener las entregas",
    });
  }
};

// 📋 Listar entregas por curso
export const listarEntregasPorCurso = async (req, res = response) => {
  const { cursoId } = req.params;

  if (!cursoId) {
    return res.status(400).json({ ok: false, msg: "cursoId es requerido" });
  }

  try {
    const entregas = await EntregaActividad.find({ cursoId })
      .populate("estudianteId", "nombre email")
      .populate("actividadId", "titulo fechaEntrega")
      .sort({ fechaEntrega: 1 });

    res.json({
      ok: true,
      entregas,
    });
  } catch (error) {
    console.error("❌ Error al listar entregas por curso:", error.message);
    res.status(500).json({
      ok: false,
      msg: "No se pudieron obtener las entregas por curso",
      error: error.message,
    });
  }
};

// ✏️ Calificar entrega, generar notificación y métricas
export const calificarEntrega = async (req, res = response) => {
  const { id } = req.params;
  const { calificacion, observaciones } = req.body;

  if (calificacion < 0 || calificacion > 20) {
    return res.status(400).json({
      ok: false,
      msg: "La calificación debe estar entre 0 y 20.",
    });
  }

  try {
    const entrega = await EntregaActividad.findById(id).populate(
      "actividadId",
      "titulo"
    );
    if (!entrega) {
      return res.status(404).json({ ok: false, msg: "Entrega no encontrada" });
    }

    entrega.calificacion = calificacion;
    entrega.observaciones = observaciones?.trim() || "";
    entrega.estado = "revisado";
    entrega.fechaRevision = new Date(); // ✅ nuevo campo

    const notificacion = await Notificacion.create({
      usuarioId: entrega.estudianteId,
      titulo: "Entrega calificada",
      mensaje: `Tu entrega para "${entrega.actividadId.titulo}" fue calificada con ${calificacion}/20.`,
      tipo: "nota",
      entregaId: entrega._id,
    });

    entrega.notificacionId = notificacion._id;
    await entrega.save();

    // 📊 Métricas automáticas por actividad
    const entregasRevisadas = await EntregaActividad.find({
      actividadId: entrega.actividadId._id,
      estado: "revisado",
    });

    const promedio = (
      entregasRevisadas.reduce((acc, e) => acc + (e.calificacion || 0), 0) /
      entregasRevisadas.length
    ).toFixed(2);

    res.json({
      ok: true,
      msg: "Entrega calificada y notificada correctamente",
      entrega,
      resumenActividad: {
        cantidadRevisadas: entregasRevisadas.length,
        promedioCalificaciones: promedio,
      },
    });
  } catch (error) {
    console.error("❌ Error al calificar entrega:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error al calificar entrega",
      error: error.message,
    });
  }
};
