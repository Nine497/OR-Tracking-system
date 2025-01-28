const express = require("express");
const router = express.Router();
const surgeryController = require("../controllers/caseController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/newSurgerycase", surgeryController.newSurgerycaseFromAPI);

// เส้นทางเจาะจง
router.get("/getCaseCalendar/", verifyToken, surgeryController.getCalendar);
router.get(
  "/getSurgery_case_ByOrID/:operating_room_id",
  verifyToken,
  surgeryController.getCaseByOrID
);
router.get(
  "/all_surgery_types",
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

// เส้นทาง dynamic
router.post("/operation/", verifyToken, surgeryController.createOperation);
router.get("/:id", verifyToken, surgeryController.getCaseById);
router.post("/:patient_id", verifyToken, surgeryController.createSurgeryCase);
router.put(
  "/:surgery_case_id",
  verifyToken,
  surgeryController.updateSurgeryCase
);
router.patch("/status/:id", verifyToken, surgeryController.updateStatusById);
router.get("/", verifyToken, surgeryController.getAllCase);
module.exports = router;
