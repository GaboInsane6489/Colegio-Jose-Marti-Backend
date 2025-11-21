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
      validate: {
        validator: (value) => value >= new Date(),
        message: "La fecha de entrega no puede estar en el pasado",
      },
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
    lapso: {
      type: String,
      enum: ["Lapso 1", "Lapso 2", "Lapso 3"],
      required: [true, "El lapso académico es obligatorio"],
    },
    cursoId: {
      type: Schema.Types.ObjectId,
      ref: "Curso",
      required: true,
      index: true,
    },
    claseId: {
      type: Schema.Types.ObjectId,
      ref: "Clase",
      required: false, // ✅ ahora opcional
      default: null, // ✅ valor por defecto
      index: true,
    },
    docenteId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recursos: [
      {
        url: {
          type: String,
          trim: true,
          validate: {
            validator: (v) => /^https?:\/\/.+/.test(v),
            message: "El recurso debe ser una URL válida",
          },
        },
        tipo: {
          type: String,
          enum: ["pdf", "video", "link", "otro"],
          default: "link",
        },
      },
    ],
    estado: {
      type: String,
      enum: ["borrador", "activa", "vencida", "cerrada"],
      default: "activa",
    },
    notificadaA: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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

// Virtuals
ActividadSchema.virtual("curso", {
  ref: "Curso",
  localField: "cursoId",
  foreignField: "_id",
  justOne: true,
});

ActividadSchema.virtual("clase", {
  ref: "Clase",
  localField: "claseId",
  foreignField: "_id",
  justOne: true,
});

ActividadSchema.virtual("docente", {
  ref: "User",
  localField: "docenteId",
  foreignField: "_id",
  justOne: true,
});

// Logs estratégicos
ActividadSchema.post("validate", function (doc) {
  console.log(`✅ Actividad validada: ${doc.titulo} (${doc.tipo})`);
});

ActividadSchema.post("save", function (doc) {
  console.log(`📦 Actividad guardada: ${doc.titulo} - Curso: ${doc.cursoId}`);
});

const Actividad = model("Actividad", ActividadSchema);
export default Actividad;
