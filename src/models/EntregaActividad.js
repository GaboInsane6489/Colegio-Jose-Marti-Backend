import mongoose from "mongoose";

const { Schema, model } = mongoose;

const EntregaSchema = new Schema(
  {
    actividadId: {
      type: Schema.Types.ObjectId,
      ref: "Actividad",
      required: true,
    },
    cursoId: {
      type: Schema.Types.ObjectId,
      ref: "Curso", // ✅ referencia institucional
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
      max: 100,
    },
    comentarioDocente: {
      type: String,
      trim: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "entregado", "vencido", "revisado"],
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
