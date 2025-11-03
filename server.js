// 📦 Carga las variables de entorno según el entorno actual
import dotenv from "dotenv";

// 🧭 Detecta si estamos en producción o desarrollo
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";

// 🧪 Carga el archivo correcto (.env para local, .env.production para Render si lo usas)
dotenv.config({ path: envFile });

// 🚀 Dependencias principales
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

// 📁 Rutas institucionales
import authRoutes from "./src/routes/authRoutes.js";
import protectedRoutes from "./src/routes/protectedRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import estudianteRoutes from "./src/routes/estudianteRoutes.js";
import estadisticasRoutes from "./src/routes/estadisticas.js";
import actividadRoutes from "./src/routes/actividadRoutes.js";
import entregaRoutes from "./src/routes/entregaRoutes.js";
import docenteRoutes from "./src/routes/docenteRoutes.js";

// 🧠 Inicializa Express
const app = express();

// 🛡️ Seguridad y CORS
const allowedOrigins = [
  process.env.CLIENT_ORIGIN, // 🌐 origen definido en .env o .env.production
  "http://localhost:5173", // 🧪 frontend local (Vite)
  "http://localhost:3000", // 🧪 frontend alternativo (React puro)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS bloqueado para origen:", origin);
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);

// 🛡️ Seguridad básica
app.use(helmet());

// 📦 Permite recibir JSON grandes (hasta 10MB)
app.use(express.json({ limit: "10mb" }));

// 🧾 Logging condicional solo en desarrollo
const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  app.use(morgan("dev")); // 🐛 muestra logs en consola
}

// 🧭 Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/estudiante", estudianteRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/actividades", actividadRoutes);
app.use("/api/entregas", entregaRoutes);
app.use("/api/docente", docenteRoutes); // ✅ Rutas para docentes

// 🔗 Conexión a MongoDB
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI no definido en el entorno");
  process.exit(1); // ⛔ detiene el servidor si no hay URI
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err.message);
    process.exit(1); // ⛔ detiene el servidor si falla la conexión
  });

// 📡 Ruta raíz institucional
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    msg: "✅ Backend Colegio José Martí activo",
    entorno: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 🚀 Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `🚀 Servidor corriendo en puerto ${PORT} (${process.env.NODE_ENV})`
  );
});
