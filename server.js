// 📦 Carga las variables de entorno desde el archivo .env
import dotenv from "dotenv";
dotenv.config();

// 🚀 Importa las dependencias principales
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

// 📁 Importa las rutas
import authRoutes from "./src/routes/authRoutes.js";
import protectedRoutes from "./src/routes/protectedRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import estudianteRoutes from "./src/routes/estudianteRoutes.js";
import estadisticasRoutes from "./src/routes/estadisticas.js";

// 🧠 Inicializa la aplicación Express
const app = express();

// 🛡️ Middlewares globales
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://colegio-jose-marti-frontend.onrender.com",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(helmet());

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

// 🔗 Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// 📡 Ruta raíz para verificación
app.get("/", (req, res) => {
  res.status(200).send("✅ Backend Colegio José Martí activo");
});

// 🚀 Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
