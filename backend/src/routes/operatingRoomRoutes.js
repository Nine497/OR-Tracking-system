const express = require("express");
const router = express.Router();
const OperatingRoomController = require("../controllers/operatingRoomController");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

router.get("/", OperatingRoomController.getAllOperatingRooms); // ดึงข้อมูลทั้งหมด
router.get("/:id", OperatingRoomController.getOperatingRoomById); // ดึงข้อมูลห้องตาม ID
router.post("/", OperatingRoomController.createOperatingRoom); // สร้างห้องใหม่
router.put("/:id", OperatingRoomController.updateOperatingRoom); // อัพเดตห้อง
router.delete("/:id", OperatingRoomController.deleteOperatingRoom); // ลบห้อง

module.exports = router;
