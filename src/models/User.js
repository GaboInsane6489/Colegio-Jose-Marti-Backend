import mongoose from "mongoose";

// 🧬 Esquema del usuario institucional
const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre completo es obligatorio"],
      trim: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Formato de correo inválido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // 🔐 Oculta el campo en consultas por defecto
    },
    role: {
      type: String,
      enum: ["admin", "docente", "estudiante"], // 🎓 Roles permitidos
      default: "estudiante",
      required: [true, "El rol es obligatorio"],
    },
    isValidated: {
      type: Boolean,
      default: false, // 🚦 Por defecto, el usuario queda pendiente
      required: true,
    },
  },
  {
    timestamps: true, // 🕒 Guarda fecha de creación y actualización
    versionKey: false, // 🧼 Elimina el campo __v
  }
);

// 🧾 Exporta el modelo institucional
const User = mongoose.model("User", userSchema);
export default User;
