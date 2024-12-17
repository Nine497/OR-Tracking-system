const express = require("express");
const router = express.Router();
const surgeryController = require("../controllers/caseController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", verifyToken, surgeryController.getAllCase);

router.get("/:id", verifyToken, surgeryController.getCaseById);

router.post("/", verifyToken, surgeryController.createSurgeryCase);

router.put("/:id", verifyToken, surgeryController.updateSurgeryCase);

router.patch(
  "/:id/status",
  verifyToken,
  surgeryController.updateSurgeryCaseStatus
);

module.exports = router;
