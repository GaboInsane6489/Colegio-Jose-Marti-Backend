import mongoose from "mongoose";
import Curso from "../models/Curso.js";
import User from "../models/User.js";
import { response } from "express";

// 🆕 Crear nuevo curso académico
const crearCurso = async (req, res = response) => {
  const {
    nombre,
    anioAcademico,
    anioEstudiantil,
    seccion,
    descripcion = "",
    materias = [],
    estudiantes = [],
  } = req.body;
  const usuarioId = req.user?.id;

  // 📥 Log de entrada
  console.log("📥 Payload recibido en crearCurso:", req.body);
  console.log("📥 Usuario autenticado:", { usuarioId, role: req.user?.role });

  if (
    !nombre?.trim() ||
    !anioAcademico ||
    !anioEstudiantil ||
    !seccion?.trim() ||
    !usuarioId
  ) {
    console.warn("⚠️ Datos incompletos:", {
      nombre,
      anioAcademico,
      anioEstudiantil,
      seccion,
      usuarioId,
    });
    return res.status(400).json({
      ok: false,
      msg: "Nombre, año académico, año estudiantil, sección y usuario son obligatorios.",
    });
  }

  const anioAcadNum = Number(anioAcademico);
  if (isNaN(anioAcadNum) || anioAcadNum < 2000 || anioAcadNum > 2100) {
    console.warn("⚠️ Año académico inválido:", anioAcademico);
    return res
      .status(400)
      .json({ ok: false, msg: "Año académico inválido (2000–2100)." });
  }

  const anioEstNum = Number(anioEstudiantil);
  if (isNaN(anioEstNum) || anioEstNum < 1 || anioEstNum > 6) {
    console.warn("⚠️ Año estudiantil inválido:", anioEstudiantil);
    return res
      .status(400)
      .json({ ok: false, msg: "Año estudiantil inválido (1–6)." });
  }

  try {
    const usuario = await User.findById(usuarioId);
    console.log("🔍 Usuario encontrado:", usuario);

    if (!usuario) {
      return res.status(403).json({ ok: false, msg: "Usuario no encontrado." });
    }

    if (usuario.role === "docente" && !usuario.isValidated) {
      return res.status(403).json({ ok: false, msg: "Docente no validado." });
    }
    if (usuario.role !== "admin" && usuario.role !== "docente") {
      return res
        .status(403)
        .json({ ok: false, msg: "Rol no autorizado para crear cursos." });
    }

    const cursoExistente = await Curso.findOne({
      nombre: nombre.trim(),
      anioAcademico: anioAcadNum,
      anioEstudiantil: anioEstNum,
      seccion: seccion.trim(),
      ...(usuario.role === "docente" ? { docenteId: usuarioId } : {}),
    });
    console.log("🔍 Curso existente:", cursoExistente);

    if (cursoExistente) {
      return res
        .status(409)
        .json({ ok: false, msg: "Ya existe un curso con esos datos." });
    }

    const materiasFormateadas = Array.isArray(materias)
      ? materias.map((m) => (typeof m === "string" ? { nombre: m } : m))
      : [];

    // ✅ Sanitizar estudiantes: IDs válidos y únicos
    const estudiantesSanitizados = Array.isArray(estudiantes)
      ? [...new Set(estudiantes)]
          .filter((id) => typeof id === "string" && id.trim())
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];

    const nuevoCurso = await Curso.create({
      nombre: nombre.trim(),
      anioAcademico: anioAcadNum,
      anioEstudiantil: anioEstNum,
      seccion: seccion.trim(),
      descripcion: descripcion?.trim() || "",
      materias: materiasFormateadas,
      estudiantes: estudiantesSanitizados,
      ...(usuario.role === "docente" ? { docenteId: usuario._id } : {}),
    });

    console.log("✅ Curso creado:", {
      id: nuevoCurso._id,
      nombre: nuevoCurso.nombre,
      anioAcademico: nuevoCurso.anioAcademico,
      anioEstudiantil: nuevoCurso.anioEstudiantil,
      seccion: nuevoCurso.seccion,
      docenteId: nuevoCurso.docenteId,
      estudiantes: nuevoCurso.estudiantes,
      descripcion: nuevoCurso.descripcion,
    });

    return res.status(201).json({
      ok: true,
      msg: "✅ Curso creado correctamente",
      curso: nuevoCurso,
    });
  } catch (error) {
    console.error("❌ Error al crear curso:", error.message, error.stack);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al crear curso",
      error: error.message,
    });
  }
};

// 👥 Asignar estudiantes a un curso
const asignarEstudiantes = async (req, res = response) => {
  const { cursoId, estudiantesIds = [] } = req.body;
  const usuarioId = req.user?.id;
  const rol = req.user?.role;

  if (!mongoose.Types.ObjectId.isValid(cursoId)) {
    return res.status(400).json({ ok: false, msg: "ID de curso inválido." });
  }

  // ✅ Sanitizar IDs antes de consultar
  const estudiantesSanitizados = Array.isArray(estudiantesIds)
    ? [...new Set(estudiantesIds)]
        .filter((id) => typeof id === "string" && id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
    : [];
  if (estudiantesSanitizados.length === 0) {
    return res
      .status(400)
      .json({ ok: false, msg: "Lista de estudiantes inválida." });
  }

  try {
    const curso = await Curso.findById(cursoId);
    if (!curso) {
      return res.status(404).json({ ok: false, msg: "Curso no encontrado." });
    }

    // 🔑 Validación de permisos
    if (rol === "docente") {
      if (!curso.docenteId || curso.docenteId.toString() !== usuarioId) {
        return res.status(403).json({
          ok: false,
          msg: "No tienes permiso para modificar este curso.",
        });
      }
    } else if (rol !== "admin") {
      return res.status(403).json({
        ok: false,
        msg: "Rol no autorizado para asignar estudiantes.",
      });
    }

    // 🔍 Validar estudiantes en DB
    const estudiantesValidos = await User.find({
      _id: { $in: estudiantesSanitizados },
      role: "estudiante",
      isValidated: true,
    });

    const idsValidos = estudiantesValidos.map((e) => e._id.toString());
    const actualesSet = new Set(curso.estudiantes.map((e) => e.toString()));
    const nuevos = idsValidos.filter((id) => !actualesSet.has(id));

    if (nuevos.length === 0) {
      console.log(`⚠️ No se asignaron nuevos estudiantes al curso ${cursoId}`);
      const actualizado = await Curso.findById(cursoId)
        .populate("docenteId", "nombre email role")
        .populate("estudiantes", "nombre email");
      return res.status(200).json({
        ok: true,
        msg: "Todos los estudiantes ya estaban asignados o no son válidos.",
        curso: actualizado,
      });
    }

    const actualizado = await Curso.findByIdAndUpdate(
      cursoId,
      { $addToSet: { estudiantes: { $each: nuevos } } },
      { new: true }
    )
      .populate("docenteId", "nombre email role")
      .populate("estudiantes", "nombre email");

    console.log(
      `✅ ${nuevos.length} estudiante(s) asignado(s) al curso ${cursoId}:`,
      nuevos
    );
    return res.status(200).json({
      ok: true,
      msg: `✅ ${nuevos.length} estudiante(s) asignado(s) correctamente`,
      curso: actualizado,
    });
  } catch (error) {
    console.error("❌ Error al asignar estudiantes:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al asignar estudiantes",
      error: error.message,
    });
  }
};

// 📚 Obtener cursos del docente autenticado
const obtenerCursosDocente = async (req, res = response) => {
  const docenteId = req.user?.id; // ✅ corregido

  if (!docenteId || !mongoose.Types.ObjectId.isValid(docenteId)) {
    return res.status(401).json({ ok: false, msg: "Docente no autenticado." });
  }

  try {
    const cursos = await Curso.find({ docenteId })
      .sort({ createdAt: -1 })
      .populate("docenteId", "nombre email role") // ✅ también poblamos docente
      .populate("estudiantes", "nombre email"); // ✅ estudiantes poblados

    return res.status(200).json({
      ok: true,
      cursos: cursos.map((c) => c.toResumen()), // ✅ respuesta compacta y consistente
    });
  } catch (error) {
    console.error("❌ Error al obtener cursos:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al consultar cursos",
      error: error.message,
    });
  }
};

// 🎓 Obtener cursos donde el estudiante está asignado
const obtenerCursosEstudiante = async (req, res = response) => {
  const estudianteId = req.user?.id;

  if (!estudianteId || !mongoose.Types.ObjectId.isValid(estudianteId)) {
    return res
      .status(401)
      .json({ ok: false, msg: "Estudiante no autenticado." });
  }

  try {
    const cursos = await Curso.find({ estudiantes: estudianteId })
      .sort({ createdAt: -1 })
      .populate("docenteId", "nombre email role")
      .populate("estudiantes", "nombre email");

    return res.status(200).json({ ok: true, cursos });
  } catch (error) {
    console.error("❌ Error al obtener cursos del estudiante:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al consultar cursos",
      error: error.message,
    });
  }
};

// ✏️ Editar curso académico
const editarCurso = async (req, res = response) => {
  const { id } = req.params;
  const { nombre, anioAcademico, anioEstudiantil, seccion, materias, activo } =
    req.body;
  const usuarioId = req.user?.id;
  const rol = req.user?.role;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, msg: "ID de curso inválido." });
  }

  try {
    const curso = await Curso.findById(id);
    if (!curso) {
      return res.status(404).json({ ok: false, msg: "Curso no encontrado." });
    }

    // 🔑 Validación de permisos
    if (rol === "docente" && curso.docenteId?.toString() !== usuarioId) {
      return res
        .status(403)
        .json({ ok: false, msg: "No puedes editar este curso." });
    }
    if (rol !== "docente" && rol !== "admin") {
      return res
        .status(403)
        .json({ ok: false, msg: "Rol no autorizado para editar cursos." });
    }

    // ✏️ Actualizaciones
    if (nombre) curso.nombre = nombre.trim();

    if (anioAcademico) {
      const anioAcadNum = Number(anioAcademico);
      if (isNaN(anioAcadNum) || anioAcadNum < 2000 || anioAcadNum > 2100) {
        return res
          .status(400)
          .json({ ok: false, msg: "Año académico inválido (2000–2100)." });
      }
      curso.anioAcademico = anioAcadNum;
    }

    if (anioEstudiantil) {
      const anioEstNum = Number(anioEstudiantil);
      if (isNaN(anioEstNum) || anioEstNum < 1 || anioEstNum > 6) {
        return res
          .status(400)
          .json({ ok: false, msg: "Año estudiantil inválido (1–6)." });
      }
      curso.anioEstudiantil = anioEstNum;
    }

    if (seccion) curso.seccion = seccion.trim();

    if (Array.isArray(materias)) {
      curso.materias = materias.map((m) =>
        typeof m === "string" ? { nombre: m } : m
      );
    } else if (materias === null) {
      curso.materias = [];
    }

    if (typeof activo === "boolean") {
      curso.activo = activo;
    }

    await curso.save();

    const actualizado = await Curso.findById(curso._id)
      .populate("docenteId", "nombre email role")
      .populate("estudiantes", "nombre email");

    return res.status(200).json({
      ok: true,
      msg: "✏️ Curso actualizado correctamente",
      curso: actualizado,
    });
  } catch (error) {
    console.error("❌ Error al editar curso:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al editar curso",
      error: error.message,
    });
  }
};

// 🗑️ Eliminar curso académico
const eliminarCurso = async (req, res = response) => {
  const { id } = req.params;
  const usuarioId = req.user?.id;
  const rol = req.user?.role;

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ ok: false, msg: "ID de curso inválido o no proporcionado." });
  }

  try {
    const curso = await Curso.findById(id);
    if (!curso) {
      return res.status(404).json({ ok: false, msg: "Curso no encontrado." });
    }

    // 🔑 Validación de permisos
    if (rol === "docente") {
      if (!curso.docenteId || curso.docenteId.toString() !== usuarioId) {
        return res
          .status(403)
          .json({ ok: false, msg: "No puedes eliminar este curso." });
      }
    } else if (rol !== "admin") {
      return res
        .status(403)
        .json({ ok: false, msg: "Rol no autorizado para eliminar cursos." });
    }

    // Poblar antes de eliminar para devolver datos completos
    await curso.populate("docenteId", "nombre email role");
    await curso.populate("estudiantes", "nombre email");

    await curso.deleteOne();

    return res.status(200).json({
      ok: true,
      msg: "🗑️ Curso eliminado correctamente",
      curso, // ✅ devuelve objeto completo poblado
    });
  } catch (error) {
    console.error("❌ Error al eliminar curso:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al eliminar curso",
      error: error.message,
    });
  }
};

// 🧑‍💼 Obtener todos los cursos (solo admin)
const obtenerCursosAdmin = async (req, res = response) => {
  try {
    const cursos = await Curso.find({ activo: true })
      .populate("docenteId", "nombre email role") // ✅ docente poblado
      .populate("estudiantes", "nombre email") // ✅ estudiantes poblados
      .sort({ createdAt: -1 });

    console.log(`🧠 Cursos activos encontrados por admin: ${cursos.length}`);
    return res.status(200).json({
      ok: true,
      cursos: cursos.map((c) => c.toResumen()), // ✅ devuelve cantidad, descripción y estudiantes si extiendes toResumen
    });
  } catch (error) {
    console.error("❌ Error al obtener cursos admin:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al consultar cursos admin",
      error: error.message,
    });
  }
};

// 📘 Obtener curso por ID (solo admin)
const obtenerCursoPorIdAdmin = async (req, res = response) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, msg: "ID de curso inválido." });
  }

  try {
    const curso = await Curso.findById(id)
      .populate("docenteId", "nombre email role")
      .populate("estudiantes", "nombre email");

    if (!curso) {
      console.warn("⚠️ Curso no encontrado:", id);
      return res.status(404).json({ ok: false, msg: "Curso no encontrado" });
    }

    console.log("📘 Curso obtenido por admin:", curso._id);

    return res.status(200).json({
      ok: true,
      curso,
      resumen: curso.toResumen(), // ✅ devuelve también resumen institucional
    });
  } catch (error) {
    console.error("❌ Error al obtener curso por ID admin:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al obtener curso",
      error: error.message,
    });
  }
};

export {
  crearCurso,
  asignarEstudiantes,
  obtenerCursosDocente,
  obtenerCursosEstudiante,
  editarCurso,
  eliminarCurso,
  obtenerCursosAdmin,
  obtenerCursoPorIdAdmin,
};
