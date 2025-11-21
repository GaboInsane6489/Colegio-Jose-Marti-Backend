import mongoose from "mongoose";
import Actividad from "../models/Actividad.js";
import Curso from "../models/Curso.js";
import Clase from "../models/Clase.js";
import { response } from "express";

// 📌 Crear nueva actividad académica (versión relajada)
const crearActividad = async (req, res = response) => {
  console.log("📥 Controlador crearActividad activado");
  console.log("🧑‍🏫 Docente autenticado:", req.user?.id);
  console.log("📦 Payload recibido:", req.body);

  const {
    titulo,
    descripcion,
    tipo,
    fechaEntrega,
    ponderacion,
    cursoId,
    claseId,
    materia,
    lapso,
    recursos = [],
    estado = "activa",
  } = req.body;

  const docenteId = req.user?.id;

  if (!docenteId || !mongoose.Types.ObjectId.isValid(docenteId)) {
    return res.status(403).json({ ok: false, msg: "Docente no autenticado." });
  }

  if (
    !titulo?.trim() ||
    !tipo?.trim() ||
    !fechaEntrega ||
    ponderacion == null ||
    !cursoId ||
    !materia?.trim() ||
    !lapso?.trim()
  ) {
    return res
      .status(400)
      .json({ ok: false, msg: "Faltan campos obligatorios." });
  }

  const curso = await Curso.findById(cursoId);
  if (!curso) {
    return res.status(404).json({ ok: false, msg: "Curso no encontrado." });
  }

  // ⚠️ Se elimina validación de docenteId y estudiantes para no bloquear

  // ⚠️ Se elimina validación estricta de claseId
  if (claseId) {
    const clase = await Clase.findById(claseId);
    if (!clase || clase.cursoId.toString() !== cursoId) {
      return res
        .status(400)
        .json({ ok: false, msg: "La clase no pertenece al curso." });
    }
  }

  const entregaDate = new Date(fechaEntrega);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (isNaN(entregaDate.getTime()) || entregaDate < hoy) {
    return res
      .status(400)
      .json({ ok: false, msg: "Fecha de entrega inválida o pasada." });
  }

  const ponderacionNum =
    typeof ponderacion === "string" ? parseFloat(ponderacion) : ponderacion;
  if (isNaN(ponderacionNum) || ponderacionNum < 0 || ponderacionNum > 100) {
    return res
      .status(400)
      .json({ ok: false, msg: "Ponderación fuera de rango (0–100)." });
  }

  const lapsosValidos = ["Lapso 1", "Lapso 2", "Lapso 3"];
  if (!lapsosValidos.includes(lapso)) {
    return res
      .status(400)
      .json({ ok: false, msg: "Lapso académico inválido." });
  }

  try {
    const nuevaActividad = new Actividad({
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || "",
      tipo: tipo.trim(),
      fechaEntrega: entregaDate,
      ponderacion: ponderacionNum,
      materia: materia.trim(),
      lapso: lapso.trim(),
      cursoId,
      claseId: claseId || null, // ✅ opcional
      docenteId,
      recursos: recursos.map((r) =>
        typeof r === "string" ? { url: r, tipo: "link" } : r
      ),
      estado,
    });

    const actividadGuardada = await nuevaActividad.save();

    console.log("✅ Actividad registrada:", actividadGuardada._id);

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

// 📋 Obtener actividades por curso, clase, año, sección, materia, lapso
const obtenerActividades = async (req, res = response) => {
  console.log("📥 Controlador obtenerActividades activado");
  console.log("🧑‍🏫 Docente autenticado:", req.user?.id);
  console.log("🔎 Filtros recibidos:", req.query);

  const { cursoId, claseId, tipo, estado, materia, lapso, anio, seccion } =
    req.query;
  const docenteId = req.user?.id;

  if (!docenteId || !mongoose.Types.ObjectId.isValid(docenteId)) {
    return res.status(403).json({ ok: false, msg: "Docente no autenticado." });
  }

  // 🔎 Construcción de filtros (relajado)
  const filtros = {};
  if (cursoId && mongoose.Types.ObjectId.isValid(cursoId))
    filtros.cursoId = cursoId;
  if (claseId && mongoose.Types.ObjectId.isValid(claseId))
    filtros.claseId = claseId;
  if (tipo && tipo !== "todos") filtros.tipo = tipo;
  if (estado && estado !== "todos") filtros.estado = estado;
  if (materia && materia !== "todos") filtros.materia = materia;
  if (lapso && lapso !== "todos") filtros.lapso = lapso;
  if (anio) filtros.anio = anio;
  if (seccion) filtros.seccion = seccion;

  try {
    // ✅ Validación de curso (simplificada)
    if (cursoId) {
      const curso = await Curso.findById(cursoId);
      if (!curso) {
        return res.status(404).json({ ok: false, msg: "Curso no encontrado." });
      }
      // ⚠️ No se compara con docenteId ni estudiantes
    }

    // 📦 Query de actividades
    const actividades = await Actividad.find(filtros)
      .select(
        "_id titulo descripcion tipo fechaEntrega ponderacion materia lapso recursos cursoId claseId estado"
      )
      .populate("curso", "anio seccion nombre docenteId")
      .sort({ fechaEntrega: 1 });

    // 🧹 Validación final (solo asegura que sean objetos válidos)
    const limpias = actividades.filter(
      (act) =>
        act &&
        typeof act === "object" &&
        act._id &&
        act.titulo &&
        act.tipo &&
        act.materia &&
        act.lapso &&
        act.fechaEntrega
    );

    console.log("📦 Actividades encontradas:", limpias.length);

    // 🚫 Forzar siempre respuesta JSON sin cache
    res.set("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, actividades: limpias });
  } catch (error) {
    console.error("❌ Error al obtener actividades:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al obtener actividades",
      error: error.message,
    });
  }
};

// 📣 Notificar estudiantes de la clase
const notificarEstudiantes = async (req, res = response) => {
  console.log("📥 Controlador notificarEstudiantes activado");
  console.log("🆔 Actividad ID:", req.params.id);
  console.log("🧑‍🏫 Docente autenticado:", req.user?.id);

  const { id } = req.params;
  const docenteId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ ok: false, msg: "ID de actividad inválido." });
  }

  if (!docenteId || !mongoose.Types.ObjectId.isValid(docenteId)) {
    return res.status(403).json({ ok: false, msg: "Docente no autenticado." });
  }

  try {
    const actividad = await Actividad.findById(id).populate("claseId");

    if (!actividad) {
      return res
        .status(404)
        .json({ ok: false, msg: "Actividad no encontrada." });
    }

    if (actividad.docenteId.toString() !== docenteId) {
      return res.status(403).json({
        ok: false,
        msg: "No tienes permiso para notificar esta actividad.",
      });
    }

    const estudiantes = Array.isArray(actividad.claseId?.estudiantes)
      ? actividad.claseId.estudiantes
      : [];

    if (estudiantes.length === 0) {
      return res.status(200).json({
        ok: true,
        msg: "No hay estudiantes registrados en la clase para notificar.",
      });
    }

    // Crear notificaciones persistentes
    const notificaciones = estudiantes.map((est) => ({
      usuarioId: est,
      titulo: "Nueva actividad",
      mensaje: `📣 Se ha publicado la actividad: ${actividad.titulo}`,
      tipo: "actividad",
      entregaId: null,
    }));

    // Guardar en el modelo Notificacion
    await mongoose.model("Notificacion").insertMany(notificaciones);

    // Marcar estudiantes notificados en la actividad
    actividad.notificadaA = estudiantes;
    await actividad.save();

    console.log(
      `📨 Notificados ${estudiantes.length} estudiantes para actividad ${id}`
    );

    return res.status(200).json({
      ok: true,
      msg: `📨 Notificación enviada a ${estudiantes.length} estudiantes`,
      notificados: estudiantes,
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

// ✏️ Editar actividad académica
const editarActividad = async (req, res = response) => {
  console.log("✏️ Controlador editarActividad activado");
  console.log("🧑‍🏫 Docente autenticado:", req.user?.id);
  console.log("🆔 ID recibido:", req.params.id);
  console.log("📦 Payload recibido:", req.body);

  const { id } = req.params;
  const {
    titulo,
    descripcion,
    tipo,
    fechaEntrega,
    ponderacion,
    materia,
    lapso,
    recursos,
    estado,
  } = req.body;

  const docenteId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ ok: false, msg: "ID de actividad inválido." });
  }

  if (!docenteId || !mongoose.Types.ObjectId.isValid(docenteId)) {
    return res.status(403).json({ ok: false, msg: "Docente no autenticado." });
  }

  try {
    const actividad = await Actividad.findById(id);
    if (!actividad) {
      return res
        .status(404)
        .json({ ok: false, msg: "Actividad no encontrada." });
    }

    if (actividad.docenteId.toString() !== docenteId) {
      return res.status(403).json({
        ok: false,
        msg: "No tienes permiso para editar esta actividad.",
      });
    }

    const curso = await Curso.findById(actividad.cursoId);
    if (!curso || curso.docenteId.toString() !== docenteId) {
      return res
        .status(403)
        .json({ ok: false, msg: "Curso asociado no válido o sin permiso." });
    }

    if (!Array.isArray(curso.estudiantes) || curso.estudiantes.length === 0) {
      return res
        .status(400)
        .json({ ok: false, msg: "El curso no tiene estudiantes asignados." });
    }

    if (titulo) actividad.titulo = titulo.trim();
    if (descripcion) actividad.descripcion = descripcion.trim();
    if (tipo) actividad.tipo = tipo.trim();

    if (fechaEntrega) {
      const nuevaFecha = new Date(fechaEntrega);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (isNaN(nuevaFecha.getTime()) || nuevaFecha < hoy) {
        return res
          .status(400)
          .json({ ok: false, msg: "Fecha de entrega inválida o pasada." });
      }
      actividad.fechaEntrega = nuevaFecha;
    }

    if (ponderacion != null) {
      const ponderacionNum =
        typeof ponderacion === "string" ? parseFloat(ponderacion) : ponderacion;
      if (isNaN(ponderacionNum) || ponderacionNum < 0 || ponderacionNum > 100) {
        return res
          .status(400)
          .json({ ok: false, msg: "La ponderación debe estar entre 0 y 100." });
      }
      actividad.ponderacion = ponderacionNum;
    }

    if (materia) actividad.materia = materia.trim();

    if (lapso) {
      const lapsosValidos = ["Lapso 1", "Lapso 2", "Lapso 3"];
      if (!lapsosValidos.includes(lapso)) {
        return res
          .status(400)
          .json({ ok: false, msg: "Lapso académico inválido." });
      }
      actividad.lapso = lapso.trim();
    }

    if (Array.isArray(recursos)) {
      actividad.recursos = recursos.map((r) =>
        typeof r === "string" ? { url: r, tipo: "link" } : r
      );
    }
    if (estado) actividad.estado = estado;

    // Reiniciar notificaciones si se edita
    if (actividad.notificadaA?.length) {
      actividad.notificadaA = [];
      console.log("🔄 Notificaciones reiniciadas por edición");
    }

    const actividadActualizada = await actividad.save();

    console.log("✅ Actividad actualizada:", actividadActualizada._id);

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

// 🗑️ Eliminar actividad académica
const eliminarActividad = async (req, res = response) => {
  console.log("🗑️ Controlador eliminarActividad activado");
  console.log("🧑‍🏫 Docente autenticado:", req.user?.id);
  console.log("🆔 ID recibido:", req.params.id);

  const { id } = req.params;
  const docenteId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ ok: false, msg: "ID de actividad inválido." });
  }

  if (!docenteId || !mongoose.Types.ObjectId.isValid(docenteId)) {
    return res.status(403).json({ ok: false, msg: "Docente no autenticado." });
  }

  try {
    const actividad = await Actividad.findById(id);

    if (!actividad) {
      return res
        .status(404)
        .json({ ok: false, msg: "Actividad no encontrada." });
    }

    if (actividad.docenteId.toString() !== docenteId) {
      return res.status(403).json({
        ok: false,
        msg: "No tienes permiso para eliminar esta actividad.",
      });
    }

    await actividad.deleteOne();

    console.log(
      `🗑️ Actividad eliminada: ${actividad._id} (${actividad.titulo})`
    );

    return res.status(200).json({
      ok: true,
      msg: "🗑️ Actividad eliminada correctamente",
      actividadId: actividad._id,
      titulo: actividad.titulo,
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

export {
  crearActividad,
  editarActividad,
  eliminarActividad,
  obtenerActividades,
  notificarEstudiantes,
};
