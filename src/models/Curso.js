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
      ref: "Usuario", // Asegúrate de que el modelo de usuario se llame así
      required: true,
    },
    estudiantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario", // Si los estudiantes también están en el modelo Usuario
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
    timestamps: true,
  }
);

export default mongoose.model("Curso", cursoSchema);
