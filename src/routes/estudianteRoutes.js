import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import { obtenerClases } from "../controllers/estudianteController.js";

const router = express.Router();

router.get("/clases", verifyToken, verifyRole(["estudiante"]), obtenerClases);

export default router;
