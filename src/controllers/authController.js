import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * 📝 Registro de usuario desde el frontend
 */
export const registerUser = async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;

    if (!email || !password || !role || !nombre) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn(`⚠️ Intento de registro duplicado: ${email}`);
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombre,
      email,
      password: hashedPassword,
      role,
      isValidated: false,
    });

    await newUser.save();

    console.log(`✅ Usuario registrado: ${email} (${role})`);
    res.status(201).json({
      message:
        "Usuario registrado correctamente. Pendiente de validación por el administrador.",
    });
  } catch (error) {
    console.error("❌ Error en el registro:", error.message);
    res.status(500).json({ message: "Error en el registro de usuario" });
  }
};

/**
 * 🔐 Login universal
 */
export const loginUser = async (req, res) => {
  try {
    const email = req.body.email || req.body.correo;
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña requeridos" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.warn(`⚠️ Login fallido: usuario no encontrado → ${email}`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!user.isValidated) {
      console.warn(`⚠️ Login bloqueado: cuenta no validada → ${email}`);
      return res.status(403).json({
        message: "Cuenta pendiente de validación por el administrador",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`⚠️ Login fallido: contraseña incorrecta → ${email}`);
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET no está definido");
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

    console.log(`✅ Login exitoso: ${email} (${user.role})`);
    res.status(200).json({
      message: "Login exitoso",
      token,
      role: user.role, // ✅ Corrección crítica
    });
  } catch (error) {
    console.error("❌ Error en el login:", error.message);
    res.status(500).json({ message: "Error en el login" });
  }
};

/**
 * 📡 Verifica sesión activa
 */
export const pingUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      console.warn("🔒 Ping fallido: usuario no autenticado");
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

/**
 * 🛠️ Creación de usuario institucional desde el panel admin
 */
export const crearUsuarioDesdeAdmin = async (req, res) => {
  try {
    const { nombre, email, role, password } = req.body;

    if (!email || !role || !password || !nombre) {
      return res
        .status(400)
        .json({ message: "Nombre, correo, rol y contraseña son obligatorios" });
    }

    const existente = await User.findOne({ email });
    if (existente) {
      console.warn(`⚠️ Usuario ya existe: ${email}`);
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
