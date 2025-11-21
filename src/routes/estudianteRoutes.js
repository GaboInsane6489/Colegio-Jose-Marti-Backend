import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import {
  obtenerClases,
  obtenerActividadesEstudiante,
  obtenerEntregasEstudiante,
  obtenerEntregaPorId,
} from "../controllers/estudianteController.js";

const router = express.Router();

/**
 * 🎓 Obtener clases activas del estudiante autenticado
 * GET /api/estudiante/clases
 */
router.get("/clases", verifyToken, verifyRole(["estudiante"]), obtenerClases);

/**
 * 📚 Obtener todas las actividades activas
 * GET /api/estudiante/actividades
 * 👉 Devuelve cualquier actividad activa con su docente, sin depender de clases/cursos
 */
router.get(
  "/actividades",
  verifyToken,
  verifyRole(["estudiante"]),
  obtenerActividadesEstudiante
);

/**
 * 📦 Obtener todas las entregas realizadas por el estudiante
 * GET /api/estudiante/entregas
 */
router.get(
  "/entregas",
  verifyToken,
  verifyRole(["estudiante"]),
  obtenerEntregasEstudiante
);

/**
 * 📘 Obtener una entrega específica del estudiante por actividadId
 * GET /api/estudiante/entrega/:id
 */
router.get(
  "/entrega/:id",
  verifyToken,
  verifyRole(["estudiante"]),
  obtenerEntregaPorId
);

export default router;
