import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ActividadSchema = new Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: "",
    },
    tipo: {
      type: String,
      enum: ["tarea", "proyecto", "examen", "otro"],
      required: [true, "El tipo de actividad es obligatorio"],
    },
    fechaEntrega: {
      type: Date,
      required: [true, "La fecha de entrega es obligatoria"],
    },
    ponderacion: {
      type: Number,
      min: [0, "La ponderación no puede ser menor que 0"],
      max: [100, "La ponderación no puede superar 100"],
      required: [true, "La ponderación es obligatoria"],
    },
    materia: {
      type: String,
      required: [true, "La materia es obligatoria"],
      trim: true,
    },
    cursoId: {
      type: Schema.Types.ObjectId,
      ref: "Curso",
      required: [true, "El curso asociado es obligatorio"],
      index: true,
    },
    docenteId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El docente asociado es obligatorio"],
      index: true,
    },
    recursos: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every(
            (url) =>
              typeof url === "string" && /^https?:\/\/.+/.test(url.trim())
          ),
        message: "Todos los recursos deben ser URLs válidas.",
      },
    },
    estado: {
      type: String,
      enum: ["activa", "vencida", "borrador"],
      default: "activa",
    },
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

// 🔗 Virtual para curso completo
ActividadSchema.virtual("curso", {
  ref: "Curso",
  localField: "cursoId",
  foreignField: "_id",
  justOne: true,
});

const Actividad = model("Actividad", ActividadSchema);
export default Actividad;
