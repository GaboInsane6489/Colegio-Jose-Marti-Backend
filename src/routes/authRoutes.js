import express from "express";
import {
  registerUser,
  loginUser,
  pingUser,
  crearUsuarioDesdeAdmin,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

// 📝 Registro de usuario (solo estudiantes desde frontend)
router.post("/register", registerUser);

// 🔐 Inicio de sesión y obtención de JWT
router.post("/login", loginUser);

// 📡 Verifica sesión y devuelve rol del usuario
router.get("/ping", verifyToken, pingUser);

// 🛠️ Creación de usuario institucional desde el panel admin
router.post(
  "/crear",
  verifyToken,
  verifyRole(["admin"]),
  crearUsuarioDesdeAdmin
);

export default router;
