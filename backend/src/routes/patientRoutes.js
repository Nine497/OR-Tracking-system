const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

router.post("/validate_link", patientController.validate_link);
router.post("/login", patientController.login);
router.post("/getPatientData", patientController.getPatientData);
router.get("/getAllStatus", patientController.getAllStatus);

module.exports = router;
