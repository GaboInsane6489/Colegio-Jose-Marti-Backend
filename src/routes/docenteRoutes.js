import express from "express";
import Curso from "../models/Curso.js";
import { verifyToken, verifyRole } from "../middlewares/index.js"; // ✅ Middlewares institucionales

const router = express.Router();

/**
 * 🎓 Crear un nuevo curso (solo docentes)
 * POST /api/docente/cursos
 */
router.post("/cursos", verifyToken, verifyRole("docente"), async (req, res) => {
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
      docenteId: req.usuario.id,
    });

    res.status(201).json({ curso: nuevoCurso });
  } catch (error) {
    console.error("❌ Error al crear curso:", error.message);
    res.status(500).json({ error: "No se pudo crear el curso" });
  }
});

/**
 * 📚 Obtener cursos del docente autenticado
 * GET /api/docente/cursos
 */
router.get("/cursos", verifyToken, verifyRole("docente"), async (req, res) => {
  try {
    const cursos = await Curso.find({ docenteId: req.usuario.id }).sort({
      createdAt: -1,
    });
    res.json({ cursos });
  } catch (error) {
    console.error("❌ Error al obtener cursos:", error.message);
    res.status(500).json({ error: "No se pudieron cargar los cursos" });
  }
});

export default router;
