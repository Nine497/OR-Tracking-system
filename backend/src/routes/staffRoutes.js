const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", verifyToken, staffController.getAllStaff);
router.post("/addstaff", verifyToken, staffController.createStaff);
router.put("/:id", verifyToken, staffController.updateStaff);
router.patch("/:id/active", verifyToken, staffController.updateActiveStaff);
router.get("/permissions/:staffId", verifyToken, staffController.getPermissionsByStaffId);

module.exports = router;
