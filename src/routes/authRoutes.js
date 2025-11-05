import express from "express";
import {
  registerUser,
  loginUser,
  crearUsuarioDesdeAdmin,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import Usuario from "../models/User.js"; // ← nombre institucional

const router = express.Router();

/**
 * 📝 Registro de usuario (solo estudiantes desde frontend)
 * Queda pendiente de validación por el administrador.
 */
router.post("/register", registerUser);

/**
 * 🔐 Inicio de sesión y obtención de JWT
 * Devuelve { token, role } si las credenciales son válidas.
 */
router.post("/login", loginUser);

/**
 * 📡 Verifica sesión activa y devuelve datos institucionales
 * Requiere token válido, busca en BD por req.user.id
 */
router.get("/ping", verifyToken, async (req, res) => {
  try {
    console.log("📡 Verificando sesión desde /ping →", req.user.id);

    const usuario = await Usuario.findById(req.user.id).select(
      "nombre email role"
    );

    if (!usuario) {
      console.warn("⚠️ Usuario no encontrado en BD →", req.user.id);
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    console.log("✅ Usuario encontrado:", usuario.email);
    res.json({
      ok: true,
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.role,
        id: usuario._id,
      },
      mensaje: "✅ Sesión activa. Datos institucionales confirmados.",
    });
  } catch (error) {
    console.error("❌ Error interno en /ping:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
});

/**
 * 🛠️ Creación de usuario institucional desde el panel admin
 * Requiere token válido y rol "admin".
 */
router.post(
  "/crear",
  verifyToken,
  verifyRole(["admin"]),
  crearUsuarioDesdeAdmin
);

export default router;
