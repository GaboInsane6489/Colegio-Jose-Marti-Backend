import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");

    const admins = [
      { email: "admin@colegio.com", password: "admin123" },
      { email: "admin2@colegio.com", password: "admin456" },
    ];

    for (const admin of admins) {
      const exists = await User.findOne({ email: admin.email });

      if (exists) {
        console.log(`⚠️ El administrador ya existe: ${admin.email}`);
      } else {
        const hashedPassword = await bcrypt.hash(admin.password, 10);

        const newAdmin = new User({
          email: admin.email,
          password: hashedPassword,
          role: "admin",
          isValidated: true,
        });

        await newAdmin.save();
        console.log(`🎉 Administrador creado: ${admin.email}`);
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
