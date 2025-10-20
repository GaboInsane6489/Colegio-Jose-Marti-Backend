import mongoose from "mongoose";

const { Schema, model } = mongoose;

const EntregaSchema = new Schema(
  {
    actividadId: {
      type: Schema.Types.ObjectId,
      ref: "Actividad",
      required: true,
    },
    estudianteId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    archivoUrl: String,
    fechaEntrega: Date,
    calificacion: Number,
    comentarioDocente: String,
    estado: {
      type: String,
      enum: ["entregado", "pendiente", "vencido"],
      default: "pendiente",
    },
  },
  { timestamps: true }
);

const EntregaActividad = model("EntregaActividad", EntregaSchema);
export default EntregaActividad;
