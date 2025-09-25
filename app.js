// 📦 Carga las variables de entorno desde el archivo .env
require("dotenv").config();

// 🚀 Importa las dependencias principales
const express = require("express");
const mongoose = require("mongoose"); // ✅ Corrección: era "mongooses"
const cors = require("cors");

// 📁 Importa las rutas de autenticación
const authRoutes = require("./src/routes/authRoutes");
const protectedRoutes = require("./src/routes/protectedRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

// 🧠 Inicializa la aplicación Express
const app = express(); // ✅ Corrección: faltaban los paréntesis

// 🛡️ Middlewares globales
app.use(cors()); // Habilita CORS para permitir peticiones entre dominios
app.use(express.json()); // Permite recibir datos en formato JSON

// 🧭 Rutas principales
app.use("/api/auth", authRoutes); // Ruta base para login y registro
app.use("/api", protectedRoutes);
app.use("/api/admin", adminRoutes);

// 🔗 Conexión a MongoDB usando Mongoose
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB")) // Mensaje de éxito
  .catch((err) => console.error("❌ Error de conexión:", err)); // ✅ Corrección: faltaba mostrar el error

// 📡 Configura el puerto del servidor
const PORT = process.env.PORT || 3000;

// 🩺 Ruta raíz para verificación de estado
app.get("/", (req, res) => {
  res.status(200).send("✅ Backend Colegio José Martí activo");
});

// 🚀 Inicia el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
