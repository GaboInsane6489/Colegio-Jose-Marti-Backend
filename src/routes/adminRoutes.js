import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Validar cuenta de usuario (solo admin)
router.patch(
  "/validar/:id",
  verifyToken,
  verifyRole(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (user.isValidated) {
        return res.status(400).json({ message: "El usuario ya está validado" });
      }

      user.isValidated = true;
      await user.save();

      res.json({ message: "✅ Usuario validado correctamente", user });
    } catch (error) {
      console.error("❌ Error al validar usuario:", error);
      res.status(500).json({ message: "Error interno al validar usuario" });
    }
  }
);

// 📋 Listar usuarios pendientes de validación (solo admin)
router.get(
  "/pendientes",
  verifyToken,
  verifyRole(["admin"]),
  async (req, res) => {
    try {
      const pendientes = await User.find({
        isValidated: false,
        role: "estudiante",
      });

      res.json({
        message: `🔍 Se encontraron ${pendientes.length} usuarios pendientes`,
        pendientes,
      });
    } catch (error) {
      console.error("❌ Error al listar pendientes:", error);
      res.status(500).json({ message: "Error interno al listar pendientes" });
    }
  }
);

export default router;
