import express from "express";
import {
  crearDocente,
  obtenerDocentes,
  actualizarDocente,
  eliminarDocente,
} from "../controllers/docentesController.js";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import { loginDocente } from "../controllers/docentesController.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole(["admin"]), crearDocente);
router.get("/", verifyToken, verifyRole(["admin"]), obtenerDocentes);
router.put("/:id", verifyToken, verifyRole(["admin"]), actualizarDocente);
router.delete("/:id", verifyToken, verifyRole(["admin"]), eliminarDocente);

router.post("/login", loginDocente);

export default router;
