const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 📝 Registro de usuario
const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
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
    console.error("❌ Error en el registro:", error);
    res.status(500).json({ message: "Error en el registro de usuario", error });
  }
};

// 🔐 Login de usuario
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Corrección: incluir el campo password explícitamente
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (!user.isValidated)
      return res.status(403).json({
        message: "Cuenta pendiente de validación por el administrador",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });

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
    console.error("❌ Error en el login:", error);
    res.status(500).json({ message: "Error en el login", error });
  }
};

// 📡 Verifica sesión y devuelve rol del usuario
const pingUser = async (req, res) => {
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
    console.error("❌ Error en ping:", error);
    res.status(500).json({ message: "Error al verificar sesión", error });
  }
};

module.exports = { registerUser, loginUser, pingUser };
