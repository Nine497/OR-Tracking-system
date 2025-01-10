const express = require("express");
const router = express.Router();
const surgeryController = require("../controllers/caseController");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

router.get("/", surgeryController.getAllCase);
router.get("/all_surgery_types", surgeryController.getAllSurgeryTypes);
router.get("/:id", surgeryController.getCaseById);
router.post("/", surgeryController.createSurgeryCase);
router.patch("/status/:id", surgeryController.updateStatusById);
router.get("/status/:id", surgeryController.getCaseWithStatusHistory);
router.get(
  "/patient/:surgery_case_id",
  surgeryController.getCaseWithPatientById
);
router.put("/:surgery_case_id", surgeryController.updateSurgeryCase);

module.exports = router;
