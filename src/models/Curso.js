import mongoose from "mongoose";

const cursoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    anioAcademico: {
      type: Number,
      required: true,
      min: [2000, "El año académico no puede ser menor que 2000"],
      max: [2100, "El año académico no puede ser mayor que 2100"],
    },
    anioEstudiantil: {
      type: Number,
      required: true,
      min: [1, "El año estudiantil no puede ser menor que 1"],
      max: [6, "El año estudiantil no puede ser mayor que 6"],
    },
    seccion: {
      type: String,
      required: true,
      trim: true,
    },
    docenteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    descripcion: {
      type: String,
      default: "",
      trim: true, // ✅ nuevo campo
    },
    estudiantes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
      validate: {
        validator: function (arr) {
          return (
            Array.isArray(arr) &&
            arr.every((id) => mongoose.Types.ObjectId.isValid(id))
          );
        },
        message: "ID de estudiante inválido",
      },
    },
    materias: [
      {
        nombre: {
          type: String,
          trim: true,
        },
        docenteAsignado: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],
    activo: {
      type: Boolean,
      default: true,
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

// 🧠 Virtual para contar estudiantes
cursoSchema.virtual("totalEstudiantes").get(function () {
  return Array.isArray(this.estudiantes) ? this.estudiantes.length : 0;
});

// 🧾 Método institucional para generar resumen (Opción B)
cursoSchema.methods.toResumen = function () {
  return {
    id: this.id,
    nombre: this.nombre,
    anioAcademico: this.anioAcademico,
    anioEstudiantil: this.anioEstudiantil,
    seccion: this.seccion,
    cantidadEstudiantes: Array.isArray(this.estudiantes)
      ? this.estudiantes.length
      : 0,
    estudiantes: Array.isArray(this.estudiantes)
      ? this.estudiantes.map((e) =>
          typeof e === "object"
            ? { id: e.id || e._id, nombre: e.nombre, email: e.email }
            : { id: e }
        )
      : [],
    materias: Array.isArray(this.materias)
      ? this.materias.map((m) => m.nombre)
      : [],
    descripcion: this.descripcion || "",
    activo: this.activo,
  };
};

export default mongoose.model("Curso", cursoSchema);
