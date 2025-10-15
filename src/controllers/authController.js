import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 📝 Registro de usuario (estudiante desde frontend)
export const registerUser = async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombre,
      email,
      password: hashedPassword,
      role,
      isValidated: false,
    });

    await newUser.save();

    res.status(201).json({
      message:
        "Usuario registrado correctamente. Pendiente de validación por el administrador.",
    });
  } catch (error) {
    console.error("❌ Error en el registro:", error.message);
    res.status(500).json({ message: "Error en el registro de usuario" });
  }
};

// 🔐 Login de usuario (por nombre o correo)
export const loginUser = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (!user.isValidated)
      return res.status(403).json({
        message: "Cuenta pendiente de validación por el administrador",
      });

    const nombreCoincide =
      user.nombre?.trim().toLowerCase() === nombre?.trim().toLowerCase();

    if (!nombreCoincide && user.email !== email)
      return res
        .status(401)
        .json({ message: "Nombre o correo no coinciden con el registro" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET no está definido en el entorno");
      return res
        .status(500)
        .json({ message: "Error interno de configuración" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        isValidated: user.isValidated,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login exitoso", token });
  } catch (error) {
    console.error("❌ Error en el login:", error.message, error.stack);
    res.status(500).json({ message: "Error en el login" });
  }
};

// 📡 Verifica sesión y devuelve rol del usuario
export const pingUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    res.status(200).json({
      message: "Sesión válida",
      role: user.role,
      email: user.email,
      userId: user.userId,
    });
  } catch (error) {
    console.error("❌ Error en ping:", error.message);
    res.status(500).json({ message: "Error al verificar sesión" });
  }
};

// 🛠️ Creación de usuario institucional desde el panel admin
export const crearUsuarioDesdeAdmin = async (req, res) => {
  try {
    const { nombre, email, role, password } = req.body;

    if (!email || !role || !password) {
      return res
        .status(400)
        .json({ message: "Correo, rol y contraseña son obligatorios" });
    }

    const existente = await User.findOne({ email });
    if (existente) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new User({
      nombre,
      email,
      role,
      password: hashedPassword,
      isValidated: true,
    });

    await nuevoUsuario.save();

    console.log(`✅ Usuario creado desde admin: ${email} (${role})`);
    res.status(201).json({
      message: "Usuario creado correctamente",
      usuario: {
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role,
      },
    });
  } catch (error) {
    console.error("❌ Error al crear usuario desde admin:", error.message);
    res.status(500).json({ message: "Error interno al crear usuario" });
  }
};
