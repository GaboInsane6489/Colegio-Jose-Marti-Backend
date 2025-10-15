import mongoose from "mongoose";

const docenteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, default: "docente" },
    activo: { type: Boolean, default: true },
    isValidated: { type: Boolean, default: true }, // ✅ necesario para login
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  },
  { timestamps: true }
);

export default mongoose.model("Docente", docenteSchema);
