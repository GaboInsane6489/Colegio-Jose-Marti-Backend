import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import {
  validarUsuario,
  rechazarUsuario,
  listarPendientes,
  listarTodosUsuarios,
  listarDocentes,
  listarEstudiantes,
  actualizarUsuario,
} from "../controllers/adminController.js";

import { obtenerTodasLasClasesAdmin } from "../controllers/claseController.js";
import { obtenerEstadisticas } from "../controllers/estadisticasController.js"; // ✅ nuevo

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
 * 👥 Listar todos los estudiantes (solo admin)
 */
router.get(
  "/estudiantes",
  verifyToken,
  verifyRole(["admin"]),
  listarEstudiantes
);

/**
 * ✏️ Actualizar usuario por ID (solo admin)
 */
router.put(
  "/actualizar/:id",
  verifyToken,
  verifyRole(["admin"]),
  actualizarUsuario
);

/**
 * 🧠 Obtener todas las clases (solo admin)
 */
router.get(
  "/clases",
  verifyToken,
  verifyRole(["admin"]),
  obtenerTodasLasClasesAdmin
);

/**
 * 📊 Obtener estadísticas institucionales (solo admin)
 */
router.get(
  "/estadisticas",
  verifyToken,
  verifyRole(["admin"]),
  obtenerEstadisticas
); // ✅ agregado

export default router;
