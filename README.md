# 📚 Colegio José Martí — Backend Académico

Sistema backend para la gestión académica institucional del Colegio José Martí. Desarrollado con Node.js, Express y MongoDB, este backend permite autenticación, validación de usuarios, gestión de clases y estadísticas administrativas.

---

## 🚀 Tecnologías principales

- 🟢 **Node.js + Express** — Servidor HTTP y rutas RESTful
- 🍃 **MongoDB + Mongoose** — Base de datos NoSQL y modelado de datos
- 🔐 **JWT** — Autenticación segura por token
- 🔒 **bcryptjs** — Encriptación de contraseñas
- ⚙️ **dotenv** — Manejo de variables de entorno
- 📋 **morgan** — Logging institucional
- ✨ **ESM** — Sintaxis moderna con `"type": "module"`

---

## 📁 Estructura del proyecto

src/ ├── controllers/ # Lógica de negocio por módulo ├── middlewares/ # Autenticación y control de roles ├── models/ # Esquemas de Mongoose ├── routes/ # Rutas agrupadas por rol scripts/ └── seedAdmin.js # Inicialización de administradores server.js # Punto de entrada principal .env # Variables de entorno (no versionar)

Código

---

## 🔐 Variables de entorno (`.env`)

```env
MONGO_URI=tu_uri_de_mongo
JWT_SECRET=tu_clave_secreta
PORT=3000
Este archivo está excluido por .gitignore y debe configurarse manualmente en Render.

🧪 Scripts disponibles
bash
npm start         # Inicia el servidor en producción
npm run dev       # Inicia en modo desarrollo con nodemon
npm run seed-admin # Crea administradores iniciales (ver scripts/seedAdmin.js)
🛡️ Rutas principales
Método	Ruta	Descripción	Protección
POST	/api/auth/register	Registro de usuario (estudiante)	Pública
POST	/api/auth/login	Login y obtención de JWT	Pública
GET	/api/auth/ping	Verifica sesión y rol	Token
GET	/api/admin/pendientes	Lista usuarios pendientes	Admin
PATCH	/api/admin/validar/:id	Valida cuenta de usuario	Admin
DELETE	/api/admin/rechazar/:id	Rechaza y elimina usuario	Admin
GET	/api/estadisticas	Estadísticas generales	Token
GET	/api/estudiante/clases	Clases activas del estudiante	Estudiante
🧬 Modelo de usuario (User.js)
js
{
  email: String,
  password: String,
  role: "admin" | "docente" | "estudiante",
  isValidated: Boolean
}
🧩 Despliegue en Render
Crear nuevo servicio web en Render

Establecer variables de entorno (MONGO_URI, JWT_SECRET)

Asegurar que el script "start" esté definido en package.json

Activar el build automático desde GitHub (opcional)

👨‍🏫 Autor
Gabriel González 📍 Caracas, Venezuela
```
