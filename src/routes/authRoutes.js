const express = require("express");
const router = express.Router();

// 📁 Controladores
const {
  registerUser,
  loginUser,
  pingUser,
} = require("../controllers/authController");

// 🛡️ Middleware de autenticación
const verifyToken = require("../middlewares/authMiddleware");

// 📝 Registro de usuario (solo estudiantes)
router.post("/register", registerUser);

// 🔐 Inicio de sesión y obtención de JWT
router.post("/login", loginUser);

// 📡 Verifica sesión y devuelve rol del usuario
router.get("/ping", verifyToken, pingUser);

module.exports = router;
