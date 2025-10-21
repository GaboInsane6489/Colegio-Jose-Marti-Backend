// 📦 Carga las variables de entorno
import dotenv from "dotenv";
dotenv.config();

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

// 🧠 Inicializa Express
const app = express();

// 🛡️ Seguridad y CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://colegio-jose-marti-frontend.onrender.com",
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

// 🧾 Logging condicional
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// 🧭 Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/estudiante", estudianteRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/actividades", actividadRoutes);
app.use("/api/entregas", entregaRoutes);

// 🔗 Conexión a MongoDB
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI no definido en el entorno");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err.message);
    process.exit(1);
  });

// 📡 Ruta raíz institucional
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    msg: "✅ Backend Colegio José Martí activo",
    timestamp: new Date().toISOString(),
  });
});

// 🚀 Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
