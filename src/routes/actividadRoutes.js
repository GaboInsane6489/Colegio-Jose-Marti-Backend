import { Router } from "express";
import {
  crearActividad,
  obtenerActividades, // ✅ nombre actualizado
  editarActividad,
  eliminarActividad,
  notificarEstudiantes,
  obtenerTodasLasActividades,
} from "../controllers/actividadController.js";

import { verifyToken, verifyRole } from "../middlewares/index.js";

const router = Router();

/**
 * 📋 Obtener actividades por curso (con filtros)
 * Acceso: Docente o estudiante autenticado
 * Método: GET /api/actividades?cursoId=...
 */
router.get(
  "/",
  verifyToken,
  verifyRole(["docente", "estudiante"]),
  obtenerActividades // ✅ controlador corregido
);

/**
 * 🐞 Ruta de depuración: obtener todas las actividades sin filtro
 * Acceso: Docente autenticado
 * Método: GET /api/actividades/debug/todas
 */
router.get(
  "/debug/todas",
  verifyToken,
  verifyRole(["docente"]),
  obtenerTodasLasActividades
);

/**
 * 📌 Crear nueva actividad
 * Acceso: Docente autenticado
 * Método: POST /api/actividades
 */
router.post("/", verifyToken, verifyRole(["docente"]), crearActividad);

/**
 * ✏️ Editar actividad existente
 * Acceso: Docente autenticado
 * Método: PUT /api/actividades/:id
 */
router.put("/:id", verifyToken, verifyRole(["docente"]), editarActividad);

/**
 * 🗑️ Eliminar actividad
 * Acceso: Docente autenticado
 * Método: DELETE /api/actividades/:id
 */
router.delete("/:id", verifyToken, verifyRole(["docente"]), eliminarActividad);

/**
 * 📣 Notificar estudiantes sobre actividad
 * Acceso: Docente autenticado
 * Método: POST /api/actividades/:id/notificar
 */
router.post(
  "/:id/notificar",
  verifyToken,
  verifyRole(["docente"]),
  notificarEstudiantes
);

export default router;
