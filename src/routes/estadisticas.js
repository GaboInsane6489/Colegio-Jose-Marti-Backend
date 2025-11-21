import express from "express";
import { obtenerEstadisticas } from "../controllers/estadisticasController.js";
import { verifyToken, verifyRole } from "../middlewares/index.js";

const router = express.Router();

/**
 * 📊 Obtener estadísticas institucionales
 * GET /api/estadisticas
 * Acceso: Solo admin autenticado
 * Devuelve:
 *  - usuariosRegistrados
 *  - pendientesValidacion
 *  - docentesActivos
 *  - estudiantesActivos
 *  - adminsActivos
 *  - usuariosInactivos
 */
router.get("/", verifyToken, verifyRole(["admin"]), obtenerEstadisticas);

export default router;
