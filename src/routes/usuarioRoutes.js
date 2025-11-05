import express from "express";
import User from "../models/User.js"; // ✅ Modelo corregido
import { verifyToken, verifyRole } from "../middlewares/index.js";

const router = express.Router();

/**
 * 🧑‍🏫 Obtener usuarios filtrados por rol
 * GET /api/usuarios?role=docente
 * Requiere token y rol admin
 */
router.get("/", verifyToken, verifyRole(["admin"]), async (req, res) => {
  const { role } = req.query;

  // 🧠 Validación de query
  if (!role || typeof role !== "string") {
    console.warn(
      "⚠️ Parámetro 'role' ausente o inválido en la query:",
      req.query
    );
    return res.status(400).json({
      ok: false,
      msg: "Parámetro 'role' requerido en la query",
    });
  }

  try {
    const usuarios = await User.find({ role }).select("nombre email role");

    if (!usuarios || usuarios.length === 0) {
      console.warn(`📭 No se encontraron usuarios con rol '${role}'`);
      return res.status(200).json({
        ok: true,
        usuarios: [],
        msg: `No hay usuarios registrados con el rol '${role}'`,
      });
    }

    console.log(`📦 Usuarios encontrados con rol '${role}':`, usuarios.length);
    res.status(200).json({ ok: true, usuarios });
  } catch (error) {
    console.error("❌ Error al obtener usuarios por rol:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al consultar usuarios",
    });
  }
});

export default router;
