import mongoose from "mongoose";

/**
 * 📚 Modelo institucional para clases académicas
 * Cada clase está asociada a un docente y puede tener estudiantes asignados
 */
const claseSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    docente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ referencia corregida al modelo de usuario
      required: true,
    },
    horario: {
      type: String,
      default: "Por asignar",
      trim: true,
    },
    estudiantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // ✅ referencia corregida al modelo de usuario
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
  }
);

// 🧾 Registro institucional del modelo de clase
const Clase = mongoose.model("Clase", claseSchema);

// 🧪 Log de confirmación al cargar el modelo
console.log("✅ Modelo Clase cargado correctamente");

export default Clase;
