import mongoose from "mongoose";

const cursoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    grado: {
      type: String,
      required: true,
      trim: true,
    },
    seccion: {
      type: String,
      required: true,
      trim: true,
    },
    docenteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario", // ✅ referencia institucional al modelo de usuario
      required: true,
    },
    estudiantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario", // ✅ estudiantes también referenciados como usuarios
      },
    ],
    materias: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true, // ✅ incluye createdAt y updatedAt
  }
);

export default mongoose.model("Curso", cursoSchema);
