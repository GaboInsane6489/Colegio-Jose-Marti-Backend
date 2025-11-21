import { Router } from "express";
import {
  registrarEntrega,
  listarEntregasPorActividad,
  calificarEntrega,
  listarEntregasPorCurso, // ✅ nuevo controlador
} from "../controllers/entregaController.js";

import { verifyToken, verifyRole } from "../middlewares/index.js";

const router = Router();

/**
 * 📌 Registrar entrega (solo estudiantes autenticados)
 * POST /api/entregas
 */
router.post("/", verifyToken, verifyRole(["estudiante"]), registrarEntrega);

/**
 * 📋 Listar entregas por actividad (solo docentes)
 * GET /api/entregas/:actividadId
 */
router.get(
  "/:actividadId",
  verifyToken,
  verifyRole(["docente"]),
  listarEntregasPorActividad
);

/**
 * ✏️ Calificar entrega (solo docentes)
 * PUT /api/entregas/:id
 */
router.put("/:id", verifyToken, verifyRole(["docente"]), calificarEntrega);

/**
 * 📚 Listar entregas por curso (solo docentes)
 * GET /api/entregas/curso/:cursoId
 */
router.get(
  "/curso/:cursoId",
  verifyToken,
  verifyRole(["docente"]),
  listarEntregasPorCurso
);

export default router;
