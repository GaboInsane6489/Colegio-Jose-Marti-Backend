import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * 🎓 Esquema institucional para actividades académicas
 * Cada actividad está asociada a un curso y un docente, y puede incluir recursos, fechas y ponderación.
 */
const ActividadSchema = new Schema(
  {
    // 📌 Título descriptivo de la actividad
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },

    // 📝 Descripción opcional
    descripcion: {
      type: String,
      trim: true,
      default: "",
    },

    // 🧭 Tipo de actividad
    tipo: {
      type: String,
      enum: ["tarea", "proyecto", "examen", "otro"],
      required: [true, "El tipo de actividad es obligatorio"],
    },

    // 📅 Fecha límite de entrega
    fechaEntrega: {
      type: Date,
      required: [true, "La fecha de entrega es obligatoria"],
    },

    // ⚖️ Ponderación en la evaluación (0–100)
    ponderacion: {
      type: Number,
      min: [0, "La ponderación no puede ser menor que 0"],
      max: [100, "La ponderación no puede superar 100"],
      required: [true, "La ponderación es obligatoria"],
    },

    // 📘 Materia asociada
    materia: {
      type: String,
      required: [true, "La materia es obligatoria"],
      trim: true,
    },

    // 🏫 Curso al que pertenece la actividad
    cursoId: {
      type: Schema.Types.ObjectId,
      ref: "Curso",
      required: [true, "El curso asociado es obligatorio"],
    },

    // 👨‍🏫 Docente que creó la actividad
    docenteId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El docente asociado es obligatorio"],
    },

    // 📎 Recursos adjuntos (URLs, archivos, etc.)
    recursos: {
      type: [String],
      default: [],
    },

    // 🚦 Estado de la actividad
    estado: {
      type: String,
      enum: ["activa", "vencida", "borrador"],
      default: "activa",
    },

    // 📣 Indicador de notificación a estudiantes
    notificada: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Actividad = model("Actividad", ActividadSchema);
export default Actividad;
