import express from "express";
import {
  registerUser,
  loginUser,
  pingUser,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📝 Registro de usuario (solo estudiantes)
router.post("/register", registerUser);

// 🔐 Inicio de sesión y obtención de JWT
router.post("/login", loginUser);

// 📡 Verifica sesión y devuelve rol del usuario
router.get("/ping", verifyToken, pingUser);

export default router;
