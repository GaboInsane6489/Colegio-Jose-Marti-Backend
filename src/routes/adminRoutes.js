import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import {
  validarUsuario,
  rechazarUsuario,
  listarPendientes,
  listarTodosUsuarios,
  listarDocentes,
  actualizarUsuario,
} from "../controllers/adminController.js";

const router = express.Router();

/**
 * ✅ Validar cuenta de usuario (solo admin)
 */
router.patch(
  "/validar/:id",
  verifyToken,
  verifyRole(["admin"]),
  validarUsuario
);

/**
 * ❌ Rechazar usuario (solo admin)
 */
router.delete(
  "/rechazar/:id",
  verifyToken,
  verifyRole(["admin"]),
  rechazarUsuario
);

/**
 * 📋 Listar usuarios pendientes de validación (solo admin)
 */
router.get("/pendientes", verifyToken, verifyRole(["admin"]), listarPendientes);

/**
 * 📦 Listar todos los usuarios (solo admin)
 */
router.get(
  "/usuarios",
  verifyToken,
  verifyRole(["admin"]),
  listarTodosUsuarios
);

/**
 * 📋 Listar todos los docentes (solo admin)
 */
router.get("/docentes", verifyToken, verifyRole(["admin"]), listarDocentes);

/**
 * ✏️ Actualizar usuario por ID (solo admin)
 */
router.put(
  "/actualizar/:id",
  verifyToken,
  verifyRole(["admin"]),
  actualizarUsuario
);

export default router;
