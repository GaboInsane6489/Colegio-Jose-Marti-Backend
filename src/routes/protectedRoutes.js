import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * 🔐 Ruta protegida general (cualquier usuario autenticado)
 * GET /api/protegida
 */
router.get("/protegida", verifyToken, (req, res) => {
  res.json({
    ok: true,
    message: "✅ Acceso autorizado",
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      nombre: req.user.nombre,
    },
  });
});

/**
 * 🛡️ Ruta exclusiva para administradores
 * GET /api/protegida/solo-admin
 */
router.get("/solo-admin", verifyToken, verifyRole(["admin"]), (req, res) => {
  res.json({
    ok: true,
    message: "👑 Bienvenido, administrador",
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      nombre: req.user.nombre,
    },
  });
});

/**
 * 📚 Ruta para docentes y administradores
 * GET /api/protegida/solo-docentes
 */
router.get(
  "/solo-docentes",
  verifyToken,
  verifyRole(["docente", "admin"]),
  (req, res) => {
    res.json({
      ok: true,
      message: "🎓 Acceso permitido para docentes y administradores",
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        nombre: req.user.nombre,
      },
    });
  }
);

export default router;
