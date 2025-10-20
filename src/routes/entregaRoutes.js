import { Router } from "express";
import {
  registrarEntrega,
  listarEntregasPorActividad,
  calificarEntrega,
} from "../controllers/entregaController.js";

import { verifyToken, verifyRole } from "../middlewares/index.js";

const router = Router();

// 📌 Registrar entrega (solo estudiantes autenticados)
router.post("/", verifyToken, verifyRole(["estudiante"]), registrarEntrega);

// 📋 Listar entregas por actividad (solo docentes)
router.get(
  "/:actividadId",
  verifyToken,
  verifyRole(["docente"]),
  listarEntregasPorActividad
);

// ✏️ Calificar entrega (solo docentes)
router.put("/:id", verifyToken, verifyRole(["docente"]), calificarEntrega);

export default router;
