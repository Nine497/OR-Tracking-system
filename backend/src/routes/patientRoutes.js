const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const validateLinkStatus = require("../middlewares/validateLink");

// ✅ กลุ่ม: การตรวจสอบลิงก์ และการล็อกอิน
router.post("/validate_link", patientController.validate_link);
router.post("/login", patientController.login);

// ✅ กลุ่ม: ดึงข้อมูลผู้ป่วย
router.get("/getPatientData/:hn_code", patientController.getPatientDataWithHN);
router.post(
  "/getPatientData",
  validateLinkStatus,
  patientController.getPatientData
);

// ✅ กลุ่ม: การจัดการผู้ป่วย
router.post("/", patientController.createOrUpdatePatient);
router.put("/:patient_id", patientController.updatePatient);

// ✅ กลุ่ม: ดึงสถานะของผู้ป่วย
router.get("/getAllStatus", patientController.getAllStatuses);
router.get("/getStatus/:id", patientController.getCaseWithStatusHistory);

// ✅ กลุ่ม: ค้นหาข้อมูลจาก Link
router.get(
  "/getLockUntilByLinkId/:link",
  patientController.getLockUntilByLinkId
);

module.exports = router;
