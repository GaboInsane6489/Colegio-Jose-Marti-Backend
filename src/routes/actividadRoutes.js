import { Router } from "express";
import {
  crearActividad,
  obtenerActividades,
  editarActividad,
  eliminarActividad,
  notificarEstudiantes,
} from "../controllers/actividadController.js";

import { obtenerActividadesEstudiante } from "../controllers/actividadEstudianteController.js";

import { verifyToken, verifyRole } from "../middlewares/index.js";

const router = Router();

/**
 * 📋 Obtener actividades por curso, clase, materia, lapso, etc.
 * Acceso: Docente o estudiante autenticado
 * Método: GET /api/actividades
 */
router.get(
  "/",
  verifyToken,
  verifyRole(["docente", "estudiante"]),
  obtenerActividades
);

/**
 * 📚 Obtener actividades asignadas al estudiante (por claseIds o filtros)
 * Acceso: Estudiante autenticado
 * Método: GET /api/actividades/estudiante
 */
router.get(
  "/estudiante",
  verifyToken,
  verifyRole(["estudiante"]),
  obtenerActividadesEstudiante
);

/**
 * 📌 Crear nueva actividad académica
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
 * 🗑️ Eliminar actividad académica
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
