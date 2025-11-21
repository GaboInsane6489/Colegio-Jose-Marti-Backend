/**
 * 🧩 Exportación centralizada de middlewares institucionales
 * Permite importar desde 'middlewares' directamente:
 * import { verifyToken, verifyRole } from "../middlewares";
 */

export { default as verifyToken } from "./authMiddleware.js";
export { default as verifyRole } from "./roleMiddleware.js";
