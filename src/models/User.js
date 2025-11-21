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
      select: false,
      validate: {
        validator: (v) => /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(v),
        message: "La contraseña debe incluir al menos una letra y un número",
      },
    },
    role: {
      type: String,
      enum: ["admin", "docente", "estudiante"],
      default: "estudiante",
      required: [true, "El rol es obligatorio"],
    },
    isValidated: {
      type: Boolean,
      default: false,
      required: true,
    },
    activo: {
      type: Boolean,
      default: true, // ✅ heredado de Docente.js
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ corregido, antes apuntaba a "Usuario"
      default: null,
    },
    docenteInfo: {
      especialidad: { type: String, trim: true, default: "" },
      cargaHoraria: { type: Number, default: 0 },
    },
    estudianteInfo: {
      grado: { type: String, trim: true, default: "" },
      seccion: { type: String, trim: true, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// 🪵 Logs estratégicos
userSchema.post("validate", function (doc) {
  console.log(`✅ Usuario validado: ${doc.nombre} (${doc.role})`);
});

userSchema.post("save", function (doc) {
  console.log(
    `📦 Usuario guardado: ${doc.nombre} - Rol: ${doc.role} - Validado: ${doc.isValidated}`
  );
});

// 🧾 Registro institucional como "User"
const User = mongoose.model("User", userSchema);
export default User;
