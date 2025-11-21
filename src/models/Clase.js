import mongoose from "mongoose";

/**
 * 📚 Modelo institucional para clases académicas
 * Cada clase está asociada a un curso, un docente y puede tener estudiantes asignados
 */
const claseSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    materia: {
      type: String,
      required: true,
      trim: true,
    },
    cursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Curso", // ✅ relación directa con curso
      required: true,
      index: true,
    },
    docenteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ referencia al modelo de usuario
      required: true,
      index: true,
    },
    horario: {
      dia: {
        type: String,
        enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        default: "Por asignar",
      },
      horaInicio: {
        type: String,
        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // ⏰ formato HH:mm
        default: "",
      },
      horaFin: {
        type: String,
        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // ⏰ formato HH:mm
        default: "",
      },
    },
    estudiantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // ✅ referencia al modelo de usuario (rol validado en controlador)
      },
    ],
    descripcion: {
      type: String,
      default: "",
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // ✅ incluye createdAt y updatedAt
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

// 🔗 Virtual para curso completo (populate institucional)
claseSchema.virtual("curso", {
  ref: "Curso",
  localField: "cursoId",
  foreignField: "_id",
  justOne: true,
});

// 🔗 Virtual para docente simplificado (populate institucional)
claseSchema.virtual("docente", {
  ref: "User",
  localField: "docenteId",
  foreignField: "_id",
  justOne: true,
});

// 🧾 Registro institucional del modelo de clase
const Clase = mongoose.model("Clase", claseSchema);

// 🧪 Log de confirmación al cargar el modelo
console.log("✅ Modelo Clase corregido y cargado correctamente");

export default Clase;
