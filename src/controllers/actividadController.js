import mongoose from "mongoose";
import Actividad from "../models/Actividad.js";
import { response } from "express";

// 📌 Crear nueva actividad académica
const crearActividad = async (req, res = response) => {
  const {
    titulo,
    descripcion,
    tipo,
    fechaEntrega,
    ponderacion,
    cursoId,
    materia,
    recursos = [],
  } = req.body;

  const docenteId = req.user?.userId;

  if (
    !titulo?.trim() ||
    !tipo?.trim() ||
    !fechaEntrega ||
    ponderacion == null ||
    !cursoId ||
    !docenteId ||
    !materia?.trim()
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Faltan campos obligatorios para crear la actividad.",
    });
  }

  const entregaDate = new Date(fechaEntrega);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (isNaN(entregaDate.getTime())) {
    return res
      .status(400)
      .json({ ok: false, msg: "La fecha de entrega no es válida." });
  }

  if (entregaDate < hoy) {
    return res.status(400).json({
      ok: false,
      msg: "La fecha de entrega no puede ser anterior al día actual.",
    });
  }

  if (typeof ponderacion !== "number" || ponderacion < 0 || ponderacion > 100) {
    return res
      .status(400)
      .json({ ok: false, msg: "La ponderación debe estar entre 0 y 100." });
  }

  if (
    !mongoose.Types.ObjectId.isValid(cursoId) ||
    !mongoose.Types.ObjectId.isValid(docenteId)
  ) {
    return res
      .status(400)
      .json({ ok: false, msg: "ID de curso o docente no válido." });
  }

  try {
    const nuevaActividad = new Actividad({
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || "",
      tipo: tipo.trim(),
      fechaEntrega: entregaDate,
      ponderacion,
      materia: materia.trim(),
      cursoId: new mongoose.Types.ObjectId(cursoId),
      docenteId: new mongoose.Types.ObjectId(docenteId),
      recursos,
      estado: "activa",
    });

    const actividadGuardada = await nuevaActividad.save();

    return res.status(201).json({
      ok: true,
      msg: "✅ Actividad creada correctamente",
      actividad: actividadGuardada,
    });
  } catch (error) {
    console.error("❌ Error al crear actividad:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al registrar actividad",
      error: error.message,
    });
  }
};

// ✏️ Editar actividad existente
const editarActividad = async (req, res = response) => {
  const { id } = req.params;
  const {
    titulo,
    descripcion,
    tipo,
    fechaEntrega,
    ponderacion,
    materia,
    recursos,
    estado,
  } = req.body;

  try {
    const actividad = await Actividad.findById(id);
    if (!actividad) {
      return res
        .status(404)
        .json({ ok: false, msg: "Actividad no encontrada." });
    }

    if (titulo) actividad.titulo = titulo.trim();
    if (descripcion) actividad.descripcion = descripcion.trim();
    if (tipo) actividad.tipo = tipo.trim();
    if (fechaEntrega) {
      const nuevaFecha = new Date(fechaEntrega);
      if (isNaN(nuevaFecha.getTime())) {
        return res
          .status(400)
          .json({ ok: false, msg: "Fecha de entrega inválida." });
      }
      actividad.fechaEntrega = nuevaFecha;
    }
    if (ponderacion != null) {
      if (
        typeof ponderacion !== "number" ||
        ponderacion < 0 ||
        ponderacion > 100
      ) {
        return res
          .status(400)
          .json({ ok: false, msg: "La ponderación debe estar entre 0 y 100." });
      }
      actividad.ponderacion = ponderacion;
    }
    if (materia) actividad.materia = materia.trim();
    if (Array.isArray(recursos)) actividad.recursos = recursos;
    if (estado) actividad.estado = estado;

    const actividadActualizada = await actividad.save();

    return res.status(200).json({
      ok: true,
      msg: "✏️ Actividad actualizada correctamente",
      actividad: actividadActualizada,
    });
  } catch (error) {
    console.error("❌ Error al editar actividad:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al editar actividad",
      error: error.message,
    });
  }
};

// 🗑️ Eliminar actividad
const eliminarActividad = async (req, res = response) => {
  const { id } = req.params;

  try {
    const actividad = await Actividad.findById(id);
    if (!actividad) {
      return res
        .status(404)
        .json({ ok: false, msg: "Actividad no encontrada." });
    }

    await actividad.deleteOne();

    return res.status(200).json({
      ok: true,
      msg: "🗑️ Actividad eliminada correctamente",
    });
  } catch (error) {
    console.error("❌ Error al eliminar actividad:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al eliminar actividad",
      error: error.message,
    });
  }
};

// 📋 Listar actividades por curso
const listarActividadesPorCurso = async (req, res = response) => {
  const { cursoId } = req.query;

  if (!cursoId || !mongoose.Types.ObjectId.isValid(cursoId)) {
    return res.status(400).json({
      ok: false,
      msg: "ID de curso inválido o no proporcionado.",
    });
  }

  try {
    const actividades = await Actividad.find({ cursoId }).sort({
      fechaEntrega: 1,
    });

    return res.status(200).json({
      ok: true,
      actividades,
    });
  } catch (error) {
    console.error("❌ Error al listar actividades:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al obtener actividades",
      error: error.message,
    });
  }
};

// 📣 Notificar estudiantes sobre actividad
const notificarEstudiantes = async (req, res = response) => {
  const { id } = req.params;

  try {
    const actividad = await Actividad.findById(id).populate("cursoId");
    if (!actividad) {
      return res
        .status(404)
        .json({ ok: false, msg: "Actividad no encontrada." });
    }

    // Simulación de envío de notificaciones (puedes integrar correo, push, etc.)
    const estudiantes = actividad.cursoId.estudiantes || [];

    if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
      return res.status(200).json({
        ok: true,
        msg: "No hay estudiantes registrados en el curso para notificar.",
      });
    }

    // Aquí podrías integrar un servicio real de notificación
    const notificados = estudiantes.map((est) => ({
      estudianteId: est,
      mensaje: `📣 Nueva actividad: ${actividad.titulo}`,
    }));

    return res.status(200).json({
      ok: true,
      msg: `📨 Notificación enviada a ${notificados.length} estudiantes`,
      notificados,
    });
  } catch (error) {
    console.error("❌ Error al notificar estudiantes:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al notificar estudiantes",
      error: error.message,
    });
  }
};

// 🐞 Obtener todas las actividades (sin filtro)
const obtenerTodasLasActividades = async (req, res = response) => {
  try {
    const actividades = await Actividad.find().sort({ fechaEntrega: 1 });

    return res.status(200).json({
      ok: true,
      total: actividades.length,
      actividades,
    });
  } catch (error) {
    console.error("❌ Error al obtener todas las actividades:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al obtener actividades",
      error: error.message,
    });
  }
};

// 🧾 Exportación institucional única
export {
  crearActividad,
  editarActividad,
  eliminarActividad,
  listarActividadesPorCurso,
  notificarEstudiantes,
  obtenerTodasLasActividades,
};
