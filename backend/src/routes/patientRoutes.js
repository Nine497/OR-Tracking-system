const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const validateLinkStatus = require("../middlewares/validateLink");

router.post("/validate_link", patientController.validate_link);
router.post("/login", patientController.login);
router.post(
  "/getPatientData",
  validateLinkStatus,
  patientController.getPatientData
);
router.get("/getAllStatus", patientController.getAllStatus);

router.get("/getStatus/:id", patientController.getCaseWithStatusHistory);

module.exports = router;
