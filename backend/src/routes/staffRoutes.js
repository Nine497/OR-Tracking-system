const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", verifyToken, staffController.getAllStaff);
router.post("/", verifyToken, staffController.createStaff);
router.put("/:id", verifyToken, staffController.updateStaff);
router.patch("/:id/active", verifyToken, staffController.updateActiveStaff);
router.get(
  "/permissions/:staffId",
  verifyToken,
  staffController.getPermissionsByStaffId
);
router.get("/permissions", verifyToken, staffController.getAllPermissions);
router.put(
  "/isActive/:staff_id",
  verifyToken,
  staffController.updateStaffActive
);
router.post(
  "/update_permissions/:staff_id",
  verifyToken,
  staffController.updatePermissions
);

module.exports = router;
