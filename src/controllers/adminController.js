import User from "../models/User.js";

// ✅ Validar usuario por ID
export const validarUsuario = async (req, res) => {
  try {
    console.log("🔐 Usuario autenticado:", req.user);

    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ message: "ID de usuario no proporcionado" });
    }

    const user = await User.findById(id);
    if (!user) {
      console.warn(`🔍 Usuario no encontrado: ${id}`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.isValidated) {
      return res.status(400).json({ message: "El usuario ya está validado" });
    }

    user.isValidated = true;
    await user.save();

    console.log(`✅ Usuario validado: ${user.email}`);
    res.json({ message: "Usuario validado correctamente", user });
  } catch (error) {
    console.error("❌ Error al validar usuario:", error.message);
    res.status(500).json({ message: "Error interno al validar usuario" });
  }
};

// 🔍 Listar usuarios pendientes de validación
export const listarPendientes = async (req, res) => {
  try {
    console.log("🔐 Usuario autenticado:", req.user);

    const pendientes = await User.find({
      isValidated: false,
      role: "estudiante",
    });

    console.log(`📋 Pendientes encontrados: ${pendientes.length}`);
    res.json({ message: "Usuarios pendientes encontrados", pendientes });
  } catch (error) {
    console.error("❌ Error al listar pendientes:", error.message);
    res.status(500).json({ message: "Error interno al listar pendientes" });
  }
};

// 📦 Listar todos los usuarios (resumen)
export const listarTodosUsuarios = async (req, res) => {
  try {
    console.log("🔐 Usuario autenticado:", req.user);

    const usuarios = await User.find({}, "email role isValidated");

    console.log(`📦 Usuarios encontrados: ${usuarios.length}`);
    res.json({ message: "Usuarios listados correctamente", usuarios });
  } catch (error) {
    console.error("❌ Error al listar todos los usuarios:", error.message);
    res.status(500).json({ message: "Error interno al listar usuarios" });
  }
};

// ❌ Rechazar (eliminar) usuario por ID
export const rechazarUsuario = async (req, res) => {
  try {
    console.log("🔐 Usuario autenticado:", req.user);

    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ message: "ID de usuario no proporcionado" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      console.warn(`🔍 Usuario no encontrado para eliminación: ${id}`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log(`❌ Usuario rechazado y eliminado: ${user.email}`);
    res.json({ message: "Usuario rechazado y eliminado", user });
  } catch (error) {
    console.error("❌ Error al rechazar usuario:", error.message);
    res.status(500).json({ message: "Error interno al rechazar usuario" });
  }
};
