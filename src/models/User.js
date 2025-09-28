import mongoose from "mongoose";

// 🧬 Esquema del usuario
const userSchema = new mongoose.Schema(
  {
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
      select: false, // 🔐 Evita que se devuelva por defecto en consultas
    },
    role: {
      type: String,
      enum: ["admin", "docente", "estudiante"], // 🎓 Roles permitidos
      default: "estudiante", // 🧑‍🎓 Valor por defecto
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
  }
);

// 🧾 Exporta el modelo
const User = mongoose.model("User", userSchema);
export default User;
