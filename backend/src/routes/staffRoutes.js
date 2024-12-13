const express = require("express");
const staffController = require("../controllers/staffController");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

// Routes
router.get("/", staffController.getAllStaff); // GET /api/staff
router.post("/", staffController.createStaff); // POST /api/staff
router.put("/:id", verifyToken, staffController.updateStaff); // PUT /api/staff/:id
router.patch("/:id/active", verifyToken, staffController.updateActiveStaff); // PATCH /api/staff/:id/active
router.get("/permissions/:staffId", staffController.getPermissionsByStaffId);
router.get("/checkPermission/:staffId", staffController.checkPermission);

module.exports = router;
