const express = require("express");
const router = express.Router();
const surgeryController = require("../controllers/caseController");
const verifyToken = require("../middlewares/verifyToken");

// 📌 Route สำหรับสร้างเคสใหม่
router.post("/newSurgeryCase", surgeryController.newSurgerycaseFromAPI);
// 📌 Route ที่เฉพาะเจาะจงควรมาก่อน
router.patch("/isActive/:id", verifyToken, surgeryController.updateIsactive);
router.put(
  "/or_room/:id",
  verifyToken,
  surgeryController.updateOR_roomBycaseId
);
router.patch("/status/:id", verifyToken, surgeryController.updateStatusById);
router.get("/getCaseCalendar", verifyToken, surgeryController.getCalendar);
router.get(
  "/getSurgeryCaseByOrID/:operating_room_id",
  verifyToken,
  surgeryController.getCaseByOrID
);
router.get(
  "/allSurgeryTypes",
  verifyToken,
  surgeryController.getAllSurgeryTypes
);
router.get(
  "/status/:id",
  verifyToken,
  surgeryController.getCaseWithStatusHistory
);
router.get(
  "/patient/:surgery_case_id",
  verifyToken,
  surgeryController.getCaseWithPatientById
);
router.get(
  "/all_surgery_types",
  verifyToken,
  surgeryController.getAllSurgeryTypes
);

// 📌 Route ที่เป็น Dynamic (ต้องอยู่ล่างกว่า)
router.post("/operation", verifyToken, surgeryController.createOperation);
router.get("/:id", verifyToken, surgeryController.getCaseById);
router.post("/:patient_id", verifyToken, surgeryController.createSurgeryCase);
router.put(
  "/:surgery_case_id",
  verifyToken,
  surgeryController.updateSurgeryCase
);
router.get("/", verifyToken, surgeryController.getAllCase);

module.exports = router;
