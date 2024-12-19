const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

router.post("/validate-token", patientController.validateToken);
router.post("/login", patientController.checkPatientDetails);

module.exports = router;
