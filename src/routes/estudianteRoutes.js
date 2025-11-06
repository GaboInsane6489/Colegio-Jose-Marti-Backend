import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import {
  obtenerClases,
  obtenerActividadesEstudiante,
  obtenerEntregasEstudiante,
  obtenerActividadesPorClases, // ✅ nuevo controlador
} from "../controllers/estudianteController.js";

const router = express.Router();

// 📚 Clases activas
router.get("/clases", verifyToken, verifyRole(["estudiante"]), obtenerClases);

// 📋 Actividades asignadas por docentes (legacy por curso)
router.get(
  "/actividades",
  verifyToken,
  verifyRole(["estudiante"]),
  obtenerActividadesEstudiante
);

// 📘 Actividades filtradas por clases (nuevo endpoint)
router.post(
  "/actividades",
  verifyToken,
  verifyRole(["estudiante"]),
  obtenerActividadesPorClases
);

// 📦 Entregas realizadas o pendientes
router.get(
  "/entregas",
  verifyToken,
  verifyRole(["estudiante"]),
  obtenerEntregasEstudiante
);

export default router;
