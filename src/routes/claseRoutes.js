import express from "express";
import { verifyToken, verifyRole } from "../middlewares/index.js";
import {
  asignarEstudiantesAClase,
  crearClase,
  obtenerTodasClases,
  actualizarClase,
  eliminarClase,
  obtenerTodasLasClasesAdmin,
  obtenerClasePorId,
  obtenerClasesEstudiante, // ✅ nuevo controlador importado
} from "../controllers/claseController.js";

const router = express.Router();

/**
 * 🧩 Asignar estudiantes a una clase específica
 * POST /api/admin/clases/asignar-estudiantes
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
 * POST /api/admin/clases
 * Solo admin
 */
router.post("/", verifyToken, verifyRole(["admin"]), crearClase);

/**
 * 📚 Obtener todas las clases (vista simple)
 * GET /api/admin/clases
 * Solo admin
 */
router.get("/", verifyToken, verifyRole(["admin"]), obtenerTodasClases);

/**
 * 🧠 Obtener todas las clases (vista enriquecida con estudiantes y curso)
 * GET /api/admin/clases/enriquecidas
 * Solo admin
 */
router.get(
  "/enriquecidas",
  verifyToken,
  verifyRole(["admin"]),
  obtenerTodasLasClasesAdmin
);

/**
 * 📘 Obtener una clase por ID
 * GET /api/admin/clases/:id
 * Solo admin
 */
router.get("/:id", verifyToken, verifyRole(["admin"]), obtenerClasePorId);

/**
 * ✏️ Actualizar clase
 * PUT /api/admin/clases/:id
 * Solo admin
 */
router.put("/:id", verifyToken, verifyRole(["admin"]), actualizarClase);

/**
 * 🗑️ Eliminar clase
 * DELETE /api/admin/clases/:id
 * Solo admin
 */
router.delete("/:id", verifyToken, verifyRole(["admin"]), eliminarClase);

/**
 * 🎓 Obtener clases asignadas a un estudiante autenticado
 * GET /api/estudiante/clases
 * Rol permitido: estudiante
 */
router.get(
  "/estudiante/clases",
  verifyToken,
  verifyRole(["estudiante"]),
  obtenerClasesEstudiante
);

export default router;
