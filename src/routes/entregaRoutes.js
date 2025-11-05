import { Router } from "express";
import {
  registrarEntrega,
  listarEntregasPorActividad,
  calificarEntrega,
} from "../controllers/entregaController.js";

import { verifyToken, verifyRole } from "../middlewares/index.js";
import EntregaActividad from "../models/EntregaActividad.js"; // ✅ Modelo institucional

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

// 📚 Listar entregas por curso (solo docentes)
router.get(
  "/curso/:cursoId",
  verifyToken,
  verifyRole(["docente"]),
  async (req, res) => {
    try {
      const { cursoId } = req.params;

      const entregas = await EntregaActividad.find({ cursoId })
        .populate("estudianteId", "nombre email")
        .populate("actividadId", "titulo lapso");

      res.json({ entregas });
    } catch (error) {
      console.error("❌ Error al obtener entregas por curso:", error.message);
      res
        .status(500)
        .json({ error: "No se pudieron cargar las entregas por curso" });
    }
  }
);

export default router;
