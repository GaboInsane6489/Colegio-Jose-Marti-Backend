import EntregaActividad from "../models/EntregaActividad.js";
import Notificacion from "../models/Notificacion.js";
import Actividad from "../models/Actividad.js";
import { response } from "express";

// 📌 Registrar entrega de estudiante
export const registrarEntrega = async (req, res = response) => {
  const { actividadId, archivoUrl } = req.body;
  const estudianteId = req.user?.userId;

  if (!actividadId || !estudianteId) {
    return res.status(400).json({
      ok: false,
      msg: "Faltan datos obligatorios: actividadId o estudianteId",
    });
  }

  try {
    const nuevaEntrega = new EntregaActividad({
      actividadId,
      estudianteId,
      archivoUrl,
      fechaEntrega: new Date(),
      estado: "entregado",
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
      .populate("estudianteId", "nombre correo")
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

// ✏️ Calificar entrega, generar notificación y métricas
export const calificarEntrega = async (req, res = response) => {
  const { id } = req.params;
  const { calificacion, comentarioDocente } = req.body;

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
    entrega.comentarioDocente = comentarioDocente?.trim() || "";
    entrega.estado = "revisado";

    const notificacion = await Notificacion.create({
      usuarioId: entrega.estudianteId,
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
