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

/**
 * 📝 Registro de usuario (solo estudiantes desde frontend)
 * Queda pendiente de validación por el administrador.
 */
router.post("/register", registerUser);

/**
 * 🔐 Inicio de sesión y obtención de JWT
 * Devuelve { token, role } si las credenciales son válidas.
 */
router.post("/login", loginUser);

/**
 * 📡 Verifica sesión activa
 * Requiere token válido, responde con rol, email y userId.
 */
router.get("/ping", verifyToken, pingUser);

/**
 * 🛠️ Creación de usuario institucional desde el panel admin
 * Requiere token válido y rol "admin".
 */
router.post(
  "/crear",
  verifyToken,
  verifyRole(["admin"]),
  crearUsuarioDesdeAdmin
);

export default router;
