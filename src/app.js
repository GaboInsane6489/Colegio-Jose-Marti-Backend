// 📦 Carga las variables de entorno desde el archivo .env
require("dotenv").config();

// 🚀 Importa las dependencias principales
const express = require("express");
const mongoose = require("mongoose"); // ✅ Corrección: era "mongooses"
const cors = require("cors");

// 📁 Importa las rutas de autenticación
const authRoutes = require("./routes/authRoutes");

// 🧠 Inicializa la aplicación Express
const app = express(); // ✅ Corrección: faltaban los paréntesis

// 🛡️ Middlewares globales
app.use(cors()); // Habilita CORS para permitir peticiones entre dominios
app.use(express.json()); // Permite recibir datos en formato JSON

// 🧭 Rutas principales
app.use("/api/auth", authRoutes); // Ruta base para login y registro

// 🔗 Conexión a MongoDB usando Mongoose
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true, // ✅ Corrección: era "useNewUrlParsel"
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado a MongoDB")) // Mensaje de éxito
  .catch((err) => console.error("❌ Error de conexión:", err)); // ✅ Corrección: faltaba mostrar el error

// 📡 Configura el puerto del servidor
const PORT = process.env.PORT || 3000;

// 🚀 Inicia el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
