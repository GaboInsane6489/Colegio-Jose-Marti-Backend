import mongoose from "mongoose";

const { Schema, model } = mongoose;

const NotificacionSchema = new Schema(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "User", // ✅ corregido
      required: true,
      index: true,
    },
    titulo: {
      type: String,
      trim: true,
      default: "Notificación",
    },
    mensaje: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      enum: [
        "nota",
        "actividad",
        "general",
        "sistema",
        "recordatorio",
        "alerta",
      ], // ✅ ampliado
      default: "general",
    },
    entregaId: {
      type: Schema.Types.ObjectId,
      ref: "EntregaActividad",
      default: null,
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

// 🪵 Logs estratégicos
NotificacionSchema.post("validate", function (doc) {
  console.log(`✅ Notificación validada: ${doc.tipo} → ${doc.mensaje}`);
});

NotificacionSchema.post("save", function (doc) {
  console.log(`📦 Notificación guardada para usuario ${doc.usuarioId}`);
});

const Notificacion = model("Notificacion", NotificacionSchema);
export default Notificacion;
