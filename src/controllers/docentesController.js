import Docente from "../models/Docente.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 📝 Crear nuevo docente institucional
export const crearDocente = async (req, res) => {
  try {
    const { nombre, correo, password, rol = "docente" } = req.body;

    if (!nombre || !correo || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    const existente = await Docente.findOne({ correo });
    if (existente) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoDocente = new Docente({
      nombre,
      correo,
      password: hashedPassword,
      rol,
      isValidated: true,
      activo: true,
      creadoPor: req.user?.userId || null,
    });

    await nuevoDocente.save();

    res.status(201).json({
      message: "Docente creado correctamente",
      docente: {
        _id: nuevoDocente._id,
        nombre: nuevoDocente.nombre,
        correo: nuevoDocente.correo,
        rol: nuevoDocente.rol,
        activo: nuevoDocente.activo,
      },
    });
  } catch (error) {
    console.error("❌ Error al crear docente:", error.message);
    res.status(500).json({ message: "Error interno al crear docente" });
  }
};

// 🔐 Login exclusivo para docentes
export const loginDocente = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const docente = await Docente.findOne({ correo }).select("+password");
    if (!docente) {
      return res.status(404).json({ message: "Docente no encontrado" });
    }

    if (!docente.isValidated) {
      return res
        .status(403)
        .json({
          message: "Cuenta pendiente de validación por el administrador",
        });
    }

    const isMatch = await bcrypt.compare(password, docente.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        userId: docente._id,
        correo: docente.correo,
        role: docente.rol,
        isValidated: docente.isValidated,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login exitoso", token });
  } catch (error) {
    console.error("❌ Error en loginDocente:", error.message);
    res.status(500).json({ message: "Error interno en el login del docente" });
  }
};

// 📋 Obtener lista de docentes (sin contraseña)
export const obtenerDocentes = async (req, res) => {
  try {
    const docentes = await Docente.find().select("-password");
    res.status(200).json(docentes);
  } catch (error) {
    console.error("❌ Error al obtener docentes:", error.message);
    res.status(500).json({ message: "Error interno al obtener docentes" });
  }
};

// ✏️ Actualizar docente
export const actualizarDocente = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = { ...req.body };

    if (actualizaciones.password) {
      actualizaciones.password = await bcrypt.hash(
        actualizaciones.password,
        10
      );
    }

    const docenteActualizado = await Docente.findByIdAndUpdate(
      id,
      actualizaciones,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!docenteActualizado) {
      return res.status(404).json({ message: "Docente no encontrado" });
    }

    res.status(200).json(docenteActualizado);
  } catch (error) {
    console.error("❌ Error al actualizar docente:", error.message);
    res.status(400).json({ message: "Error al actualizar docente" });
  }
};

// 🗑️ Eliminar docente
export const eliminarDocente = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Docente.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ message: "Docente no encontrado" });
    }

    res.status(200).json({ message: "Docente eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar docente:", error.message);
    res.status(500).json({ message: "Error interno al eliminar docente" });
  }
};
