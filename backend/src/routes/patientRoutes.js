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
router.get("/getAllStatus", async (req, res) => {
  try {
    const statuses = await patientController.getAllStatuses();
    if (statuses.message) {
      return res.status(404).json(statuses);
    }
    res.status(200).json(statuses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve statuses", details: error.message });
  }
});
router.get("/getStatus/:id", patientController.getCaseWithStatusHistory);
router.post("/", patientController.createPatient);
router.put("/:patient_id", patientController.updatePatient);
router.get("/getPatientData/:hn_code", patientController.getPatientDataWithHN)

module.exports = router;
