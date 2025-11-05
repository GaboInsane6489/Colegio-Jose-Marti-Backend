import express from "express";
import { obtenerEstadisticas } from "../controllers/estadisticasController.js";
import { verifyToken, verifyRole } from "../middlewares/index.js"; // ✅ importación centralizada

const router = express.Router();

/**
 * 📊 Ruta protegida para obtener estadísticas institucionales
 * Acceso exclusivo para usuarios autenticados con rol "admin"
 */
router.get("/", verifyToken, verifyRole(["admin"]), obtenerEstadisticas);

export default router;
