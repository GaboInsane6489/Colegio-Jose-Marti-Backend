const express = require("express");
const router = express.Router();

// 📁 Importa el controlador de autenticación
const { registerUser, loginUser } = require("../controllers/authController");

// 📝 Ruta para registrar un nuevo usuario
router.post("/register", registerUser);

// 🔐 Ruta para iniciar sesión y obtener el JWT
router.post("/login", loginUser);

module.exports = router;
