// 📦 Carga las variables de entorno desde el archivo .env
import dotenv from "dotenv";
dotenv.config();

// 🚀 Importa las dependencias principales
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";

// 📁 Importa las rutas
import authRoutes from "./src/routes/authRoutes.js";
import protectedRoutes from "./src/routes/protectedRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import estudianteRoutes from "./src/routes/estudianteRoutes.js"; // ✅ nueva ruta

// 🧠 Inicializa la aplicación Express
const app = express();

// 🛡️ Middlewares globales
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan("dev")); // ✅ Logging institucional

// 🧭 Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/estudiante", estudianteRoutes); // ✅ activación de ruta estudiante

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
