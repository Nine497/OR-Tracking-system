// routes/surgeryRoutes.js

const express = require("express");
const router = express.Router();
const surgeryController = require("../controllers/doctorController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", verifyToken, surgeryController.getAllDoctors);

router.get("/:id", verifyToken, surgeryController.getDoctorById);

router.post("/", verifyToken, surgeryController.createDoctor);

router.put("/:id", verifyToken, surgeryController.updateDoctor);

router.delete("/:id", verifyToken, surgeryController.deleteDoctor);

module.exports = router;
