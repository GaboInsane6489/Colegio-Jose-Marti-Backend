import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Usuario from "../src/models/User.js"; // ← ajusta si tu modelo está en otra ruta

// 🧠 Carga del .env desde la raíz del proyecto
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.length < 10) {
      console.error("❌ MONGO_URI no está definido o es inválido");
      return;
    }

    console.log("🧪 MONGO_URI leído:", mongoUri);
    await mongoose.connect(mongoUri);
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
      const email = admin.email?.toLowerCase().trim();
      const nombre = admin.nombre?.trim();
      const password = admin.password?.trim();

      if (!nombre || !email || !password) {
        console.warn(`⚠️ Datos incompletos para: ${JSON.stringify(admin)}`);
        continue;
      }

      const existe = await Usuario.findOne({ email });

      if (existe) {
        console.log(`🔁 Ya existe: ${email}`);
      } else {
        const hashed = await bcrypt.hash(password, 10);

        const nuevoAdmin = new Usuario({
          nombre,
          email,
          password: hashed,
          role: "admin",
          isValidated: true,
        });

        await nuevoAdmin.save();
        console.log(`🎉 Administrador creado: ${nombre}`);
      }
    }
  } catch (error) {
    console.error("❌ Error al crear administradores:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexión cerrada");
  }
};

seedAdmin();
