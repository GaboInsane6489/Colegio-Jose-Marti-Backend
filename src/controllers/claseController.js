import Clase from "../models/Clase.js";

/**
 * 🆕 Crear una nueva clase académica
 * POST /api/clases
 */
export const crearClase = async (req, res) => {
  const { nombre, docenteId, horario, descripcion, materia } = req.body;

  if (!nombre || !docenteId || !horario || !materia) {
    console.warn("⚠️ Datos incompletos para crear clase:", req.body);
    return res.status(400).json({
      ok: false,
      msg: "Nombre, docente, horario y materia son obligatorios",
    });
  }

  try {
    const nuevaClase = await Clase.create({
      nombre: nombre.trim(),
      docenteId,
      horario: horario.trim(),
      materia: materia.trim(), // ✅ nuevo campo requerido
      descripcion: descripcion?.trim() || "",
      activo: true,
    });

    console.log("✅ Clase creada:", nuevaClase._id);
    res.status(201).json({ ok: true, clase: nuevaClase });
  } catch (error) {
    console.error("❌ Error al crear clase:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al crear clase",
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
      .sort({ createdAt: -1 });

    console.log(`📦 Clases encontradas: ${clases.length}`);
    res.status(200).json({ ok: true, clases });
  } catch (error) {
    console.error("❌ Error al obtener clases:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al consultar clases",
    });
  }
};

/**
 * ✏️ Actualiza una clase existente
 * PUT /api/clases/:id
 */
export const actualizarClase = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    console.log("✏️ Solicitud de actualización recibida:", { id, datos });

    const clase = await Clase.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    });

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
 * DELETE /api/clases/:id
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
 * 🎯 Asigna estudiantes a una clase institucional
 */
export const asignarEstudiantesAClase = async (req, res) => {
  try {
    const { claseId, estudiantesIds } = req.body;

    console.log("📡 Solicitud de asignación recibida:");
    console.log("🆔 Clase ID:", claseId);
    console.log("👥 Estudiantes a asignar:", estudiantesIds);

    if (
      !claseId ||
      !Array.isArray(estudiantesIds) ||
      estudiantesIds.length === 0
    ) {
      console.warn(
        "⚠️ Datos incompletos o inválidos en la solicitud:",
        req.body
      );
      return res.status(400).json({
        ok: false,
        msg: "Clase ID y lista de estudiantes son obligatorios",
      });
    }

    const clase = await Clase.findById(claseId);
    if (!clase) {
      console.warn("⚠️ Clase no encontrada:", claseId);
      return res.status(404).json({ ok: false, msg: "Clase no encontrada" });
    }

    const actuales = clase.estudiantes.map((e) => e.toString());
    const nuevos = estudiantesIds.filter((id) => !actuales.includes(id));

    console.log(`📦 Nuevos estudiantes a agregar (${nuevos.length}):`, nuevos);

    if (nuevos.length === 0) {
      console.log("ℹ️ Todos los estudiantes ya estaban asignados.");
      await clase.populate("estudiantes", "nombre email");
      return res.status(200).json({
        ok: true,
        msg: "Todos los estudiantes ya estaban asignados",
        clase,
      });
    }

    clase.estudiantes.push(...nuevos);
    await clase.save();
    await clase.populate("estudiantes", "nombre email");

    console.log("✅ Clase actualizada correctamente:", clase._id);
    res.json({
      ok: true,
      msg: "Estudiantes asignados correctamente",
      clase,
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
      .populate("estudiantes", "nombre email")
      .sort({ createdAt: -1 });

    console.log(`🧠 Clases encontradas por admin: ${clases.length}`);
    res.status(200).json({ clases });
  } catch (error) {
    console.error("❌ Error al obtener clases para admin:", error.message);
    res
      .status(500)
      .json({ msg: "Error interno al consultar clases para admin" });
  }
};
