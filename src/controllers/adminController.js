const User = require("../models/User");

// ✅ Validar cuenta de usuario
const validarUsuario = async (req, res) => {
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
};

// 📋 Listar usuarios pendientes
const listarPendientes = async (req, res) => {
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
};

// ❌ Rechazar usuario (opcional)
const rechazarUsuario = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "❌ Usuario rechazado y eliminado", user });
  } catch (error) {
    console.error("❌ Error al rechazar usuario:", error);
    res.status(500).json({ message: "Error interno al rechazar usuario" });
  }
};

module.exports = {
  validarUsuario,
  listarPendientes,
  rechazarUsuario,
};
