import dotenv from "dotenv";
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: envFile });

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
import claseRoutes from "./src/routes/claseRoutes.js"; // ✅ clases router preparado para /api/admin/clases
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import cursosRoutes from "./src/routes/cursosRoutes.js";

const app = express();

// 🛡️ Seguridad y CORS
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(",") ?? [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
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

// 🧾 Logging condicional
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
  console.log("🧪 Modo desarrollo activo: logs detallados habilitados");
}

// 🧭 Rutas protegidas y públicas
app.use("/api/auth", authRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/estudiante", estudianteRoutes);

// 🔍 Middleware trazable para actividades
app.use(
  "/api/actividades",
  (req, res, next) => {
    console.log("📡 Actividades:", req.method, req.url);
    next();
  },
  actividadRoutes
);

app.use("/api/entregas", entregaRoutes);
app.use("/api/docente", docenteRoutes);

// ✅ Usuarios
app.use("/api/usuarios", usuarioRoutes);

// ✅ Corrección: rutas institucionales unificadas
// - Cursos bajo /api/admin/cursos
// - Clases bajo /api/admin/clases (el router ya no define /api/clases internos)
app.use("/api/admin/cursos", cursosRoutes);
app.use("/api/admin/clases", claseRoutes);

// 🔒 Rutas protegidas genéricas
app.use("/api", protectedRoutes);

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

// 🧱 Sirve frontend en producción
if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientPath = path.join(__dirname, "dist");

  app.use(express.static(clientPath));
  app.get("*", (req, res) => res.sendFile(path.join(clientPath, "index.html")));
}

// 🚀 Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `🚀 Servidor corriendo en puerto ${PORT} (${process.env.NODE_ENV})`
  );
  console.log("🧠 Sistema institucional activo y trazable");
});
