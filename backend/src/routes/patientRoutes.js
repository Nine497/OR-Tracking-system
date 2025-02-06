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
router.get(
  "/getLockUntilByLinkId/:link",
  patientController.getLockUntilByLinkId
);
router.get("/getAllStatus", patientController.getAllStatuses);
router.get("/getStatus/:id", patientController.getCaseWithStatusHistory);
router.post("/", patientController.createPatient);
router.put("/:patient_id", patientController.updatePatient);
router.get("/getPatientData/:hn_code", patientController.getPatientDataWithHN);

module.exports = router;
