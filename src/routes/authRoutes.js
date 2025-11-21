import express from "express";
import {
  registerUser,
  loginUser,
  crearUsuarioDesdeAdmin,
  pingUser, // ✅ usar controlador en lugar de lógica inline
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
 * 📡 Verifica sesión activa y devuelve datos institucionales
 * Requiere token válido, busca en BD por req.user.id
 */
router.get("/ping", verifyToken, pingUser); // ✅ ahora usa controlador

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
