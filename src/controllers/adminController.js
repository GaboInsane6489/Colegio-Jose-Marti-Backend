import bcrypt from "bcryptjs";
import User from "../models/User.js";

/**
 * ✅ Validar usuario por ID
 * Marca al usuario como validado institucionalmente.
 */
export const validarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ message: "ID de usuario no proporcionado" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.isValidated) {
      return res.status(400).json({ message: "El usuario ya está validado" });
    }

    user.isValidated = true;
    user.activo = true; // ✅ aseguramos que quede activo al validarlo
    await user.save();

    console.log(`✅ Usuario validado: ${user.email}`);
    res.json({ message: "Usuario validado correctamente", user });
  } catch (error) {
    console.error("❌ Error al validar usuario:", error.message);
    res.status(500).json({ message: "Error interno al validar usuario" });
  }
};

/**
 * 🔍 Listar usuarios pendientes de validación
 * Filtra por estudiantes no validados.
 */
export const listarPendientes = async (req, res) => {
  try {
    const pendientes = await User.find({
      isValidated: false,
      role: "estudiante",
    }).select("nombre email role activo isValidated _id");

    res.json({ message: "Usuarios pendientes encontrados", pendientes });
  } catch (error) {
    console.error("❌ Error al listar pendientes:", error.message);
    res.status(500).json({ message: "Error interno al listar pendientes" });
  }
};

/**
 * 📦 Listar todos los usuarios (resumen institucional)
 * Devuelve email, rol y estado de validación.
 */
export const listarTodosUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find(
      {},
      "nombre email role activo isValidated"
    );

    res.json({ message: "Usuarios listados correctamente", usuarios });
  } catch (error) {
    console.error("❌ Error al listar todos los usuarios:", error.message);
    res.status(500).json({ message: "Error interno al listar usuarios" });
  }
};

/**
 * 📋 Listar todos los docentes institucionales
 */
export const listarDocentes = async (req, res) => {
  try {
    const docentes = await User.find({ role: "docente" }).select(
      "nombre email isValidated activo _id"
    );
    res
      .status(200)
      .json({ message: "Docentes listados correctamente", docentes });
  } catch (error) {
    console.error("❌ Error al listar docentes:", error.message);
    res.status(500).json({ message: "Error interno al listar docentes" });
  }
};

/**
 * 👥 Listar todos los estudiantes institucionales
 */
export const listarEstudiantes = async (req, res) => {
  try {
    const estudiantes = await User.find({ role: "estudiante" }).select(
      "nombre email isValidated activo _id"
    );
    res
      .status(200)
      .json({ message: "Estudiantes listados correctamente", estudiantes });
  } catch (error) {
    console.error("❌ Error al listar estudiantes:", error.message);
    res.status(500).json({ message: "Error interno al listar estudiantes" });
  }
};

/**
 * ✏️ Actualizar usuario institucional por ID
 */
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = { ...req.body };

    if (actualizaciones.password) {
      actualizaciones.password = await bcrypt.hash(
        actualizaciones.password,
        10
      );
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      actualizaciones,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!usuarioActualizado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Usuario actualizado correctamente",
      usuarioActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error.message);
    res.status(400).json({ message: "Error al actualizar usuario" });
  }
};

/**
 * ❌ Rechazar (eliminar) usuario por ID
 */
export const rechazarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ message: "ID de usuario no proporcionado" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log(`❌ Usuario rechazado y eliminado: ${user.email}`);
    res.json({ message: "Usuario rechazado y eliminado", user });
  } catch (error) {
    console.error("❌ Error al rechazar usuario:", error.message);
    res.status(500).json({ message: "Error interno al rechazar usuario" });
  }
};
