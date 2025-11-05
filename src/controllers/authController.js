import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/User.js"; // ← nombre institucional

/**
 * 📝 Registro de usuario desde el frontend
 */
export const registerUser = async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;

    if (!email || !password || !role || !nombre) {
      return res.status(400).json({
        ok: false,
        msg: "Todos los campos son obligatorios",
      });
    }

    const existente = await Usuario.findOne({ email });
    if (existente) {
      console.warn(`⚠️ Intento de registro duplicado: ${email}`);
      return res.status(400).json({
        ok: false,
        msg: "El usuario ya existe",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      role,
      isValidated: false,
    });

    await nuevoUsuario.save();

    console.log(`✅ Usuario registrado: ${email} (${role})`);
    res.status(201).json({
      ok: true,
      msg: "Usuario registrado correctamente. Pendiente de validación por el administrador.",
    });
  } catch (error) {
    console.error("❌ Error en el registro:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error en el registro de usuario",
    });
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
      return res.status(400).json({
        ok: false,
        msg: "Email y contraseña requeridos",
      });
    }

    const usuario = await Usuario.findOne({ email }).select("+password");
    if (!usuario) {
      console.warn(`⚠️ Login fallido: usuario no encontrado → ${email}`);
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    if (!usuario.isValidated) {
      console.warn(`⚠️ Login bloqueado: cuenta no validada → ${email}`);
      return res.status(403).json({
        ok: false,
        msg: "Cuenta pendiente de validación por el administrador",
      });
    }

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      console.warn(`⚠️ Login fallido: contraseña incorrecta → ${email}`);
      return res.status(401).json({
        ok: false,
        msg: "Contraseña incorrecta",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET no está definido");
      return res.status(500).json({
        ok: false,
        msg: "Error interno de configuración JWT",
      });
    }

    const token = jwt.sign(
      {
        userId: usuario._id,
        email: usuario.email,
        role: usuario.role,
        isValidated: usuario.isValidated,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`✅ Login exitoso: ${email} (${usuario.role})`);
    res.status(200).json({
      ok: true,
      msg: "Login exitoso",
      token,
      role: usuario.role,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.role,
        isValidated: usuario.isValidated,
      },
    });
  } catch (error) {
    console.error("❌ Error en el login:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error en el login",
    });
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
      return res.status(401).json({
        ok: false,
        msg: "Usuario no autenticado",
      });
    }

    res.status(200).json({
      ok: true,
      msg: "Sesión válida",
      role: user.role,
      usuario: {
        _id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        isValidated: user.isValidated,
      },
    });
  } catch (error) {
    console.error("❌ Error en ping:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error al verificar sesión",
    });
  }
};

/**
 * 🛠️ Creación de usuario institucional desde el panel admin
 */
export const crearUsuarioDesdeAdmin = async (req, res) => {
  try {
    const { nombre, email, role, password } = req.body;

    if (!email || !role || !password || !nombre) {
      return res.status(400).json({
        ok: false,
        msg: "Nombre, correo, rol y contraseña son obligatorios",
      });
    }

    const existente = await Usuario.findOne({ email });
    if (existente) {
      console.warn(`⚠️ Usuario ya existe: ${email}`);
      return res.status(409).json({
        ok: false,
        msg: "El correo ya está registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      role,
      password: hashedPassword,
      isValidated: true,
    });

    await nuevoUsuario.save();

    console.log(`✅ Usuario creado desde admin: ${email} (${role})`);
    res.status(201).json({
      ok: true,
      msg: "Usuario creado correctamente",
      usuario: {
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role,
      },
    });
  } catch (error) {
    console.error("❌ Error al crear usuario desde admin:", error.message);
    res.status(500).json({
      ok: false,
      msg: "Error interno al crear usuario",
    });
  }
};
