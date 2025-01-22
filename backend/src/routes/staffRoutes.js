const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

router.get("/", staffController.getAllStaff);
router.post("/", staffController.createStaff);
router.put("/:id", staffController.updateStaff);
router.patch("/:id/active", staffController.updateActiveStaff);
router.get("/permissions/:staffId", staffController.getPermissionsByStaffId);
router.get("/permissions", staffController.getAllPermissions);
router.put("/isActive/:staff_id", staffController.updateStaffActive);
router.post("/update_permissions/:staff_id", staffController.updatePermissions);

module.exports = router;
