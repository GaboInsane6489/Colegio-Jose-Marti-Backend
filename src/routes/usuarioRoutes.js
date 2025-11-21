import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middlewares/index.js";

const router = express.Router();

/**
 * 🧑‍🏫 Obtener usuarios filtrados por rol
 * GET /api/usuarios?role=docente|estudiante|admin
 * Requiere token y rol admin o docente (solo estudiantes validados)
 */
router.get("/", verifyToken, async (req, res) => {
  const { role, isValidated } = req.query;

  // 🧠 Validación de query
  const rolesPermitidos = ["admin", "docente", "estudiante"];
  if (!role || typeof role !== "string" || !rolesPermitidos.includes(role)) {
    console.warn(
      "⚠️ Parámetro 'role' ausente o inválido en la query:",
      req.query
    );
    return res.status(400).json({
      ok: false,
      msg: "Parámetro 'role' requerido y debe ser uno de: admin, docente, estudiante",
    });
  }

  // 🔒 Control de acceso
  const userRole = req.user.role; // viene del token
  const filtro = { role };

  if (userRole === "admin") {
    // ✅ Admin puede consultar cualquier rol
    if (role === "estudiante" && isValidated !== undefined) {
      filtro.isValidated = isValidated === "true";
    }
  } else if (userRole === "docente") {
    // ✅ Docente solo puede consultar estudiantes validados
    if (role !== "estudiante") {
      return res
        .status(403)
        .json({ ok: false, msg: "Acceso denegado para docentes" });
    }
    filtro.isValidated = true; // 🔒 Forzamos validación
  } else {
    return res.status(403).json({ ok: false, msg: "Acceso denegado" });
  }

  try {
    const usuarios = await User.find(filtro).select(
      "nombre email role _id isValidated"
    );

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
