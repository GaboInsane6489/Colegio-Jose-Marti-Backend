import mongoose from "mongoose";

const { Schema, model } = mongoose;

const NotificacionSchema = new Schema(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    mensaje: {
      type: String,
      required: true,
      trim: true,
    },

    tipo: {
      type: String,
      enum: ["nota", "actividad", "general"],
      default: "general",
    },

    entregaId: {
      type: Schema.Types.ObjectId,
      ref: "EntregaActividad",
    },

    leido: {
      type: Boolean,
      default: false,
    },

    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Notificacion = model("Notificacion", NotificacionSchema);
export default Notificacion;
