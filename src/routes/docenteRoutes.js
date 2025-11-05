import express from "express";
import Curso from "../models/Curso.js";
import Clase from "../models/Clase.js";
import { verifyToken, verifyRole } from "../middlewares/index.js"; // ✅ Middlewares institucionales

const router = express.Router();

/**
 * 🎓 Crear un nuevo curso (solo docentes)
 * POST /api/docente/cursos
 */
router.post(
  "/cursos",
  verifyToken,
  verifyRole(["docente"]),
  async (req, res) => {
    const { nombre, grado, seccion, materias } = req.body;

    if (!nombre || !grado || !seccion) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
      const nuevoCurso = await Curso.create({
        nombre: nombre.trim(),
        grado: grado.trim(),
        seccion: seccion.trim(),
        materias: Array.isArray(materias) ? materias.map((m) => m.trim()) : [],
        docenteId: req.user.userId, // ✅ Corrección aquí
      });

      res.status(201).json({ curso: nuevoCurso });
    } catch (error) {
      console.error("❌ Error al crear curso:", error.message);
      res.status(500).json({ error: "No se pudo crear el curso" });
    }
  }
);

/**
 * 📚 Obtener cursos del docente autenticado
 * GET /api/docente/cursos
 */
router.get(
  "/cursos",
  verifyToken,
  verifyRole(["docente"]),
  async (req, res) => {
    try {
      const cursos = await Curso.find({ docenteId: req.user.userId }).sort({
        createdAt: -1,
      });
      res.json({ cursos });
    } catch (error) {
      console.error("❌ Error al obtener cursos:", error.message);
      res.status(500).json({ error: "No se pudieron cargar los cursos" });
    }
  }
);

/**
 * 🧑‍🏫 Obtener clases del docente autenticado
 * GET /api/docente/clases
 */
router.get(
  "/clases",
  verifyToken,
  verifyRole(["docente"]),
  async (req, res) => {
    try {
      const clases = await Clase.find({ docente: req.user.userId }).populate(
        "estudiantes",
        "nombre email"
      );
      res.json({ clases });
    } catch (error) {
      console.error("❌ Error al obtener clases:", error.message);
      res.status(500).json({ error: "No se pudieron cargar las clases" });
    }
  }
);

export default router;
