// 📦 Carga las variables de entorno según el entorno actual
import dotenv from "dotenv";

// 🧭 Detecta si estamos en producción o desarrollo
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: envFile });

// 🚀 Dependencias principales
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// 📁 Rutas institucionales
import authRoutes from "./src/routes/authRoutes.js";
import protectedRoutes from "./src/routes/protectedRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import estudianteRoutes from "./src/routes/estudianteRoutes.js";
import estadisticasRoutes from "./src/routes/estadisticas.js";
import actividadRoutes from "./src/routes/actividadRoutes.js";
import entregaRoutes from "./src/routes/entregaRoutes.js";
import docenteRoutes from "./src/routes/docenteRoutes.js";
import claseRoutes from "./src/routes/claseRoutes.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js"; // ✅ Nueva ruta para usuarios por rol

// 🧠 Inicializa Express
const app = express();

// 🛡️ Seguridad y CORS
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://localhost:3000",
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

app.use(helmet());
app.use(express.json({ limit: "10mb" }));

// 🧾 Logging condicional solo en desarrollo
const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  app.use(morgan("dev"));
  console.log("🧪 Modo desarrollo activo: logs detallados habilitados");
}

// 🧭 Rutas protegidas y públicas (orden importa)
app.use("/api/auth", authRoutes); // ✅ asegura que /api/auth/ping esté disponible
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/estudiante", estudianteRoutes);
app.use("/api/actividades", actividadRoutes);
app.use("/api/entregas", entregaRoutes);
app.use("/api/docente", docenteRoutes);
app.use("/api/clases", claseRoutes);
app.use("/api/usuarios", usuarioRoutes); // ✅ nueva ruta activa
app.use("/api", protectedRoutes); // 🔒 rutas protegidas genéricas

// 🔗 Conexión a MongoDB
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI no definido en el entorno");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    console.log("📦 Base de datos institucional lista");
  })
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err.message);
    process.exit(1);
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

// 🧱 Sirve frontend en producción (si aplica)
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientPath = path.join(__dirname, "dist");

  app.use(express.static(clientPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// 🚀 Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `🚀 Servidor corriendo en puerto ${PORT} (${process.env.NODE_ENV})`
  );
  console.log("🧠 Sistema institucional activo y trazable");
});
