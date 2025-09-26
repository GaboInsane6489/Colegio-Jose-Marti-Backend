const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");
const { obtenerClases } = require("../controllers/estudianteController");

router.get("/clases", verifyToken, verifyRole(["estudiante"]), obtenerClases);

module.exports = router;
