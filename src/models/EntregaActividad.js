import mongoose from "mongoose";

const { Schema, model } = mongoose;

const EntregaSchema = new Schema(
  {
    actividadId: {
      type: Schema.Types.ObjectId,
      ref: "Actividad",
      required: true,
    },
    claseId: {
      type: Schema.Types.ObjectId,
      ref: "Clase",
      required: true,
    },
    cursoId: {
      type: Schema.Types.ObjectId,
      ref: "Curso",
      required: true,
    },
    estudianteId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    archivoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "El archivo debe ser una URL válida",
      },
    },
    fechaEntrega: {
      type: Date,
    },
    calificacion: {
      type: Number,
      min: 0,
      max: 20,
    },
    observaciones: {
      type: String,
      trim: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "entregado", "vencido", "revisado"],
      default: "pendiente",
    },
    fechaRevision: {
      type: Date,
    },
    notificacionId: {
      type: Schema.Types.ObjectId,
      ref: "Notificacion",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        // Normalizamos para que el frontend reciba siempre "id"
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const EntregaActividad = model("EntregaActividad", EntregaSchema);
export default EntregaActividad;
