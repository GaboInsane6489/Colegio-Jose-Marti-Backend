import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

const seedAdmins = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ MONGO_URI no está definido en el entorno");
      return;
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");

    const admins = [
      {
        nombre: "Korina Izturiz",
        email: "admin@colegio.com",
        password: "admin123",
      },
      {
        nombre: "Administrador Secundario",
        email: "admin2@colegio.com",
        password: "admin456",
      },
    ];

    for (const admin of admins) {
      if (!admin.nombre || !admin.email || !admin.password) {
        console.warn(`⚠️ Datos incompletos para: ${JSON.stringify(admin)}`);
        continue;
      }

      const exists = await User.findOne({ email: admin.email });

      if (exists) {
        console.log(`🔁 Ya existe: ${admin.email}`);
      } else {
        const hashedPassword = await bcrypt.hash(admin.password, 10);

        const newAdmin = new User({
          nombre: admin.nombre,
          email: admin.email,
          password: hashedPassword,
          role: "admin", // 🔐 Rol fijo institucional
          isValidated: true, // ✅ Validación automática
        });

        await newAdmin.save();
        console.log(`🎉 Administrador creado: ${admin.nombre}`);
      }
    }
  } catch (error) {
    console.error("❌ Error al crear administradores:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexión cerrada");
  }
};

seedAdmins();
