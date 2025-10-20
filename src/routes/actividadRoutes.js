import { Router } from "express";
import {
  crearActividad,
  listarActividadesPorCurso,
  editarActividad,
  eliminarActividad,
  notificarEstudiantes,
  obtenerTodasLasActividades, // 🐞 Ruta de depuración
} from "../controllers/actividadController.js";

import { verifyToken, verifyRole } from "../middlewares/index.js";

const router = Router();

/**
 * 📌 Crear nueva actividad
 * Acceso: Docente autenticado
 * Método: POST /api/actividades
 */
router.post("/", verifyToken, verifyRole(["docente"]), crearActividad);

/**
 * 📋 Listar actividades por curso
 * Acceso: Docente o estudiante autenticado
 * Método: GET /api/actividades?cursoId=...
 */
router.get(
  "/",
  verifyToken,
  verifyRole(["docente", "estudiante"]),
  listarActividadesPorCurso
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
