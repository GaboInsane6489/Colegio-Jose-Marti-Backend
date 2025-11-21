import express from "express";
import { verifyToken, verifyRole } from "../middlewares/index.js";
import {
  crearCurso,
  asignarEstudiantes,
  obtenerCursosDocente,
} from "../controllers/cursoController.js";
import { obtenerClasesDelDocente } from "../controllers/obtenerClasesDelDocente.js";
import { listarEstudiantes } from "../controllers/adminController.js"; // reutilizamos controlador
import { asignarEstudiantesAClase } from "../controllers/claseController.js"; // nuevo controlador

const router = express.Router();

/**
 * 🆕 Crear curso académico
 * POST /api/docente/cursos
 */
router.post("/cursos", verifyToken, verifyRole(["docente"]), crearCurso);

/**
 * 👥 Asignar estudiantes a curso
 * POST /api/docente/cursos/asignar
 */
router.post(
  "/cursos/asignar",
  verifyToken,
  verifyRole(["docente"]),
  asignarEstudiantes
);

/**
 * 📚 Obtener cursos del docente
 * GET /api/docente/cursos
 */
router.get(
  "/cursos",
  verifyToken,
  verifyRole(["docente"]),
  obtenerCursosDocente
);

/**
 * 🧑‍🏫 Obtener clases del docente
 * GET /api/docente/clases
 */
router.get(
  "/clases",
  verifyToken,
  verifyRole(["docente"]),
  obtenerClasesDelDocente
);

/**
 * 👥 Asignar estudiantes a una clase
 * POST /api/docente/clases/asignar-estudiantes
 */
router.post(
  "/clases/asignar-estudiantes",
  verifyToken,
  verifyRole(["docente"]),
  asignarEstudiantesAClase
);

/**
 * 🧑‍🎓 Obtener estudiantes disponibles
 * GET /api/docente/estudiantes
 */
router.get(
  "/estudiantes",
  verifyToken,
  verifyRole(["docente"]),
  listarEstudiantes
);

export default router;
