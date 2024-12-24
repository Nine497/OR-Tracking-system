const express = require("express");
const router = express.Router();
const surgeryController = require("../controllers/caseController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", verifyToken, surgeryController.getAllCase);

router.get("/:id", verifyToken, surgeryController.getCaseById);

router.post("/", verifyToken, surgeryController.createSurgeryCase);

router.put("/:id", verifyToken, surgeryController.updateSurgeryCase);

router.patch("/status/:id", verifyToken, surgeryController.updateStatusById);

router.get(
  "/status/:id",
  verifyToken,
  surgeryController.getCaseWithStatusHistory
);

module.exports = router;
