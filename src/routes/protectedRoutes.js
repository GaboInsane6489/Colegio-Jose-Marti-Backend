import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

// 🔐 Ruta protegida general (cualquier usuario autenticado)
router.get("/protegida", verifyToken, (req, res) => {
  res.json({
    message: "✅ Acceso autorizado",
    user: req.user, // Incluye userId, email, role, etc.
  });
});

// 🛡️ Ruta exclusiva para administradores
router.get("/solo-admin", verifyToken, verifyRole(["admin"]), (req, res) => {
  res.json({
    message: "👑 Bienvenido, administrador",
    user: req.user,
  });
});

// 📚 Ruta para docentes y administradores
router.get(
  "/solo-docentes",
  verifyToken,
  verifyRole(["docente", "admin"]),
  (req, res) => {
    res.json({
      message: "🎓 Acceso permitido para docentes y administradores",
      user: req.user,
    });
  }
);

export default router;
