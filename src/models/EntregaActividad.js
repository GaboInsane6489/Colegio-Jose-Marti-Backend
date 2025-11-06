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
      ref: "Clase", // ✅ nueva referencia directa
      required: true,
    },
    cursoId: {
      type: Schema.Types.ObjectId,
      ref: "Curso",
      required: true,
    },
    estudianteId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    archivoUrl: {
      type: String,
      trim: true,
    },
    fechaEntrega: {
      type: Date,
    },
    calificacion: {
      type: Number,
      min: 0,
      max: 20, // 🎯 ajustado a escala venezolana
    },
    observaciones: {
      type: String,
      trim: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "entregado", "vencido", "revisado", "calificado"],
      default: "pendiente",
    },
    notificacionId: {
      type: Schema.Types.ObjectId,
      ref: "Notificacion",
    },
  },
  { timestamps: true }
);

const EntregaActividad = model("EntregaActividad", EntregaSchema);
export default EntregaActividad;
