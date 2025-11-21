import Clase from "../models/Clase.js";
import User from "../models/User.js"; // ✅ Importación añadida para validar estudiantes
import mongoose from "mongoose";

/**
 * 🆕 Crear una nueva clase académica
 * POST /api/clases o /api/admin/clases
 */
export const crearClase = async (req, res) => {
  const { nombre, docenteId, cursoId, horario, descripcion, materia } =
    req.body;

  if (!nombre || !docenteId || !cursoId || !horario || !materia) {
    console.warn("⚠️ Datos incompletos para crear clase:", req.body);
    return res.status(400).json({
      ok: false,
      msg: "Nombre, docente, curso, horario y materia son obligatorios",
    });
  }

  if (
    !mongoose.Types.ObjectId.isValid(docenteId) ||
    !mongoose.Types.ObjectId.isValid(cursoId)
  ) {
    return res
      .status(400)
      .json({ ok: false, msg: "IDs inválidos para docente o curso" });
  }

  try {
    const nuevaClase = await Clase.create({
      nombre: nombre.trim(),
      docenteId,
      cursoId,
      horario: {
        dia: horario.dia || "Por asignar",
        horaInicio: horario.horaInicio || "",
        horaFin: horario.horaFin || "",
      },
      materia: materia.trim(),
      descripcion: descripcion?.trim() || "",
      estudiantes: [], // ✅ inicializado
      activo: true,
    });

    console.log("✅ Clase creada:", nuevaClase._id);
    res.status(201).json({ ok: true, clase: nuevaClase });
  } catch (error) {
    console.error("❌ Error al crear clase:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al crear clase",
      detalle: error.message,
    });
  }
};

/**
 * 📚 Obtener todas las clases creadas
 * GET /api/clases
 */
export const obtenerTodasClases = async (req, res) => {
  try {
    const clases = await Clase.find()
      .populate("docenteId", "nombre email role")
      .populate("cursoId", "nombre anioAcademico anioEstudiantil seccion") // ✅ incluye anioEstudiantil
      .sort({ createdAt: -1 });

    console.log(`📦 Clases encontradas: ${clases.length}`);
    res.status(200).json({ ok: true, clases });
  } catch (error) {
    console.error("❌ Error al obtener clases:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al consultar clases",
      detalle: error.message,
    });
  }
};

/**
 * ✏️ Actualiza una clase existente
 * PUT /api/clases/:id o /api/admin/clases/:id
 */
export const actualizarClase = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    console.log("✏️ Solicitud de actualización recibida:", { id, datos });

    if (datos.horario && typeof datos.horario === "object") {
      datos.horario = {
        dia: datos.horario.dia || "Por asignar",
        horaInicio: datos.horario.horaInicio || "",
        horaFin: datos.horario.horaFin || "",
      };
    }

    if (datos.docenteId && !mongoose.Types.ObjectId.isValid(datos.docenteId)) {
      return res.status(400).json({ ok: false, msg: "ID de docente inválido" });
    }
    if (datos.cursoId && !mongoose.Types.ObjectId.isValid(datos.cursoId)) {
      return res.status(400).json({ ok: false, msg: "ID de curso inválido" });
    }

    const clase = await Clase.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    })
      .populate("docenteId", "nombre email role")
      .populate("cursoId", "nombre anioAcademico anioEstudiantil seccion")
      .populate("estudiantes", "nombre email");

    if (!clase) {
      console.warn("⚠️ Clase no encontrada para actualizar:", id);
      return res.status(404).json({ ok: false, msg: "Clase no encontrada" });
    }

    console.log("✅ Clase actualizada:", clase._id);
    res.json({ ok: true, clase });
  } catch (error) {
    console.error("❌ Error al actualizar clase:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al actualizar clase",
      detalle: error.message,
    });
  }
};

/**
 * 🗑️ Elimina una clase existente
 * DELETE /api/clases/:id o /api/admin/clases/:id
 */
export const eliminarClase = async (req, res) => {
  try {
    const { id } = req.params;

    const clase = await Clase.findByIdAndDelete(id);
    if (!clase) {
      console.warn("⚠️ Clase no encontrada para eliminar:", id);
      return res.status(404).json({ ok: false, msg: "Clase no encontrada" });
    }

    console.log("🗑️ Clase eliminada:", clase._id);
    res.json({ ok: true, msg: "Clase eliminada correctamente", clase });
  } catch (error) {
    console.error("❌ Error al eliminar clase:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al eliminar clase",
      detalle: error.message,
    });
  }
};

/**
 * 📌 Asigna estudiantes a una clase institucional
 * POST /api/clases/asignar-estudiantes
 */
export const asignarEstudiantesAClase = async (req, res) => {
  try {
    const { claseId, estudiantesIds } = req.body;

    console.log("📡 Solicitud de asignación recibida:", {
      claseId,
      estudiantesIds,
    });

    if (
      !claseId ||
      !Array.isArray(estudiantesIds) ||
      estudiantesIds.length === 0
    ) {
      return res.status(400).json({
        ok: false,
        msg: "Clase ID y lista de estudiantes son obligatorios",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(claseId)) {
      return res.status(400).json({ ok: false, msg: "ID de clase inválido" });
    }

    const clase = await Clase.findById(claseId);
    if (!clase) {
      return res.status(404).json({ ok: false, msg: "Clase no encontrada" });
    }

    // 🔍 Validar estudiantes en BD
    const estudiantesValidos = await User.find({
      _id: { $in: estudiantesIds },
      role: "estudiante",
      isValidated: true,
    });

    const idsValidos = estudiantesValidos.map((e) => e._id.toString());

    const actuales = new Set(clase.estudiantes.map((e) => e.toString()));

    const nuevos = idsValidos.filter((id) => !actuales.has(id));

    if (nuevos.length === 0) {
      await clase.populate("estudiantes", "nombre email");
      return res.status(200).json({
        ok: true,
        msg: "Todos los estudiantes ya estaban asignados o no son válidos",
        clase,
      });
    }

    const actualizado = await Clase.findByIdAndUpdate(
      claseId,
      { $addToSet: { estudiantes: { $each: nuevos } } },
      { new: true }
    )
      .populate("docenteId", "nombre email role")
      .populate("cursoId", "nombre anioAcademico anioEstudiantil seccion")
      .populate("estudiantes", "nombre email");

    console.log("✅ Clase actualizada correctamente:", actualizado._id);
    res.json({
      ok: true,
      msg: `Estudiantes asignados correctamente (${nuevos.length})`,
      clase: actualizado,
    });
  } catch (error) {
    console.error("❌ Error al asignar estudiantes:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al asignar estudiantes",
      detalle: error.message,
    });
  }
};

/**
 * 🧠 Devuelve todas las clases registradas (solo admin)
 * GET /api/admin/clases
 */
export const obtenerTodasLasClasesAdmin = async (req, res) => {
  try {
    const clases = await Clase.find()
      .populate("docenteId", "nombre email role")
      .populate("cursoId", "nombre anioAcademico anioEstudiantil seccion") // ✅ incluye anioEstudiantil
      .populate("estudiantes", "nombre email")
      .sort({ createdAt: -1 });

    console.log(`🧠 Clases encontradas por admin: ${clases.length}`);
    res.status(200).json({ ok: true, clases });
  } catch (error) {
    console.error("❌ Error al obtener clases para admin:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al consultar clases para admin",
      detalle: error.message,
    });
  }
};

/**
 * 📘 Obtener una clase por ID
 * GET /api/clases/:id o /api/admin/clases/:id
 */
export const obtenerClasePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const clase = await Clase.findById(id)
      .populate("docenteId", "nombre email")
      .populate("cursoId", "nombre anioAcademico anioEstudiantil seccion") // ✅ incluye anioEstudiantil
      .populate("estudiantes", "nombre email");

    if (!clase) {
      console.warn("⚠️ Clase no encontrada:", id);
      return res.status(404).json({ ok: false, msg: "Clase no encontrada" });
    }

    console.log("📘 Clase obtenida:", clase._id);
    res.json({ ok: true, clase });
  } catch (error) {
    console.error("❌ Error al obtener clase por ID:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al obtener clase",
      detalle: error.message,
    });
  }
};

/**
 * 📚 Obtener clases asignadas a un estudiante
 * GET /api/estudiante/clases
 */
export const obtenerClasesEstudiante = async (req, res) => {
  const estudianteId = req.user?.id;

  if (!estudianteId || !mongoose.Types.ObjectId.isValid(estudianteId)) {
    return res
      .status(403)
      .json({ ok: false, msg: "Estudiante no autenticado." });
  }

  try {
    const clases = await Clase.find({ estudiantes: estudianteId })
      .populate("docenteId", "nombre email role")
      .populate("cursoId", "nombre anioAcademico anioEstudiantil seccion")
      .populate("estudiantes", "nombre email");

    console.log("📦 Clases encontradas:", clases.length);

    return res.status(200).json({ ok: true, clases });
  } catch (error) {
    console.error("❌ Error al obtener clases del estudiante:", error.message);
    return res.status(500).json({
      ok: false,
      msg: "Error interno al obtener clases del estudiante",
      detalle: error.message,
    });
  }
};
