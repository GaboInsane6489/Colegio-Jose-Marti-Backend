import express from "express";
import { verifyToken, verifyRole } from "../middlewares/index.js";
import {
  asignarEstudiantesAClase,
  crearClase,
  obtenerTodasClases,
  actualizarClase,
  eliminarClase,
} from "../controllers/claseController.js";

const router = express.Router();

/**
 * 🧩 Asignar estudiantes a una clase específica
 * POST /api/clases/asignar-estudiantes
 * Roles permitidos: admin, docente
 */
router.post(
  "/asignar-estudiantes",
  verifyToken,
  verifyRole(["admin", "docente"]),
  asignarEstudiantesAClase
);

/**
 * 🆕 Crear nueva clase
 * POST /api/clases
 * Solo admin
 */
router.post("/", verifyToken, verifyRole(["admin"]), crearClase);

/**
 * 📚 Obtener todas las clases
 * GET /api/clases
 * Solo admin
 */
router.get("/", verifyToken, verifyRole(["admin"]), obtenerTodasClases);

/**
 * ✏️ Actualizar clase
 * PUT /api/clases/:id
 * Solo admin
 */
router.put("/:id", verifyToken, verifyRole(["admin"]), actualizarClase);

/**
 * 🗑️ Eliminar clase
 * DELETE /api/clases/:id
 * Solo admin
 */
router.delete("/:id", verifyToken, verifyRole(["admin"]), eliminarClase);

export default router;
