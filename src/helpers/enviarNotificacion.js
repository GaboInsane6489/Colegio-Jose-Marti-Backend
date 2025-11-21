import User from "../models/User.js";
import Curso from "../models/Curso.js";

/**
 * 📣 Simulación de envío de notificación institucional
 * Puedes reemplazar con integración real: correo, push, SMS, etc.
 */
const enviarNotificacion = async (cursoId, mensaje) => {
  try {
    // Obtener estudiantes inscritos en el curso
    const curso = await Curso.findById(cursoId).populate(
      "estudiantes",
      "nombre email"
    );

    if (!curso || !curso.estudiantes || curso.estudiantes.length === 0) {
      console.warn("⚠️ No hay estudiantes inscritos en el curso.");
      return [];
    }

    // Simular envío de notificación a cada estudiante
    const destinatarios = curso.estudiantes.map((estudiante) => {
      console.log(`📣 Notificación enviada a ${estudiante.email}: ${mensaje}`);
      return { nombre: estudiante.nombre, email: estudiante.email };
    });

    return destinatarios;
  } catch (error) {
    console.error("❌ Error al enviar notificaciones:", error.message);
    return null;
  }
};

export default enviarNotificacion;
