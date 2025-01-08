const express = require("express");
const router = express.Router();
const surgeryController = require("../controllers/caseController");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

router.get("/", surgeryController.getAllCase);
router.get("/all_surgery_types", surgeryController.getAllSurgeryTypes);
router.get("/:id", surgeryController.getCaseById);
router.post("/", surgeryController.createSurgeryCase);
router.put("/:id", surgeryController.updateSurgeryCase);
router.patch("/status/:id", surgeryController.updateStatusById);
router.get("/status/:id", surgeryController.getCaseWithStatusHistory);

module.exports = router;
