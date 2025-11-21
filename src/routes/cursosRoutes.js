import { Router } from "express";
import {
  crearCurso,
  asignarEstudiantes,
  obtenerCursosDocente,
  obtenerCursosEstudiante,
  editarCurso,
  eliminarCurso,
  obtenerCursosAdmin,
  obtenerCursoPorIdAdmin,
} from "../controllers/cursoController.js";

import { verifyToken, verifyRole } from "../middlewares/index.js";

const router = Router();

/**
 * 🆕 Crear nuevo curso
 * - Admin: crea cursos institucionales (/api/admin/cursos)
 * - Docente: crea cursos propios (/api/cursos)
 */
router.post("/", verifyToken, verifyRole(["admin"]), crearCurso);

/**
 * 👥 Asignar estudiantes a curso
 * Roles permitidos: admin, docente
 * - Admin: /api/admin/cursos/asignar-estudiantes
 * - Docente: /api/cursos/asignar-estudiantes
 */
router.post(
  "/asignar-estudiantes",
  verifyToken,
  verifyRole(["admin", "docente"]),
  asignarEstudiantes
);

/**
 * 📚 Obtener cursos del docente
 * - Ruta: /api/cursos/docente
 */
router.get(
  "/docente",
  verifyToken,
  verifyRole(["docente"]),
  obtenerCursosDocente
);

/**
 * 🎓 Obtener cursos del estudiante
 * - Ruta: /api/cursos/estudiante
 */
router.get(
  "/estudiante",
  verifyToken,
  verifyRole(["estudiante"]),
  obtenerCursosEstudiante
);

/**
 * 🧑‍💼 Obtener cursos administrados (solo admin)
 * - Ruta: /api/admin/cursos
 */
router.get("/", verifyToken, verifyRole(["admin"]), obtenerCursosAdmin);

/**
 * 📘 Obtener curso por ID (solo admin)
 * - Ruta: /api/admin/cursos/:id
 */
router.get("/:id", verifyToken, verifyRole(["admin"]), obtenerCursoPorIdAdmin);

/**
 * ✏️ Editar curso
 * - Docente: /api/cursos/:id
 * - Admin: /api/admin/cursos/:id
 */
router.put("/:id", verifyToken, verifyRole(["admin"]), editarCurso);

/**
 * 🗑️ Eliminar curso
 * - Docente: /api/cursos/:id
 * - Admin: /api/admin/cursos/:id
 */
router.delete("/:id", verifyToken, verifyRole(["admin"]), eliminarCurso);

export default router;
