const Usuario = require("../models/Usuario");
const Curso = require("../models/Curso");

// Simulación de envío de notificación (puedes reemplazar con correo, push, etc.)
const enviarNotificacion = async (cursoId, mensaje) => {
  try {
    // Obtener estudiantes inscritos en el curso
    const curso = await Curso.findById(cursoId).populate("estudiantes");

    if (!curso || !curso.estudiantes || curso.estudiantes.length === 0) {
      console.warn("⚠️ No hay estudiantes inscritos en el curso.");
      return;
    }

    // Simular envío de notificación a cada estudiante
    curso.estudiantes.forEach((estudiante) => {
      console.log(`📣 Notificación enviada a ${estudiante.correo}: ${mensaje}`);
      // Aquí podrías integrar correo, push, SMS, etc.
    });

    return true;
  } catch (error) {
    console.error("❌ Error al enviar notificaciones:", error);
    return false;
  }
};

module.exports = enviarNotificacion;
