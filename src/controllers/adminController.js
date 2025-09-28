import User from "../models/User.js";

export const validarUsuario = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    if (user.isValidated)
      return res.status(400).json({ message: "El usuario ya está validado" });

    user.isValidated = true;
    await user.save();

    console.log(`✅ Usuario ${user.email} validado`);
    res.json({ message: "✅ Usuario validado correctamente", user });
  } catch (error) {
    console.error("❌ Error al validar usuario:", error);
    res.status(500).json({ message: "Error interno al validar usuario" });
  }
};

export const listarPendientes = async (req, res) => {
  try {
    const pendientes = await User.find({
      isValidated: false,
      role: "estudiante",
    });
    res.json({ message: `🔍 ${pendientes.length} pendientes`, pendientes });
  } catch (error) {
    console.error("❌ Error al listar pendientes:", error);
    res.status(500).json({ message: "Error interno al listar pendientes" });
  }
};

export const listarTodosUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({}, "email role isValidated");
    res.json({
      message: `📦 ${usuarios.length} usuarios encontrados`,
      usuarios,
    });
  } catch (error) {
    console.error("❌ Error al listar todos los usuarios:", error);
    res.status(500).json({ message: "Error interno al listar usuarios" });
  }
};

export const rechazarUsuario = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    console.log(`❌ Usuario ${user.email} rechazado`);
    res.json({ message: "❌ Usuario rechazado y eliminado", user });
  } catch (error) {
    console.error("❌ Error al rechazar usuario:", error);
    res.status(500).json({ message: "Error interno al rechazar usuario" });
  }
};
