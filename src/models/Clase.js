import mongoose from "mongoose";

const claseSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    docente: {
      type: String,
      required: true,
    },
    horario: {
      type: String,
      default: "Por asignar",
    },
    estudiantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    descripcion: {
      type: String,
      default: "",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Clase = mongoose.model("Clase", claseSchema);
export default Clase;
