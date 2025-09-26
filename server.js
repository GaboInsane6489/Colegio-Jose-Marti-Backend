// 📦 Carga las variables de entorno desde el archivo .env
require("dotenv").config();

// 🚀 Importa las dependencias principales
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

// 📁 Importa las rutas
const authRoutes = require("./src/routes/authRoutes");
const protectedRoutes = require("./src/routes/protectedRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const estudianteRoutes = require("./src/routes/estudianteRoutes"); // ✅ nueva ruta

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
