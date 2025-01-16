const express = require("express");
const router = express.Router();
const surgeryController = require("../controllers/caseController");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

// เส้นทางเจาะจง
router.get("/getCaseCalendar/", surgeryController.getCalendar);
router.get(
  "/getSurgery_case_ByOrID/:operating_room_id",
  surgeryController.getCaseByOrID
);
router.get("/all_surgery_types", surgeryController.getAllSurgeryTypes);
router.get("/status/:id", surgeryController.getCaseWithStatusHistory);
router.get(
  "/patient/:surgery_case_id",
  surgeryController.getCaseWithPatientById
);

// เส้นทาง dynamic
router.get("/:id", surgeryController.getCaseById);
router.post("/:patient_id", surgeryController.createSurgeryCase);
router.put("/:surgery_case_id", surgeryController.updateSurgeryCase);
router.patch("/status/:id", surgeryController.updateStatusById);
router.post("/operation/", surgeryController.createOperation);
router.get("/", surgeryController.getAllCase);

module.exports = router;
