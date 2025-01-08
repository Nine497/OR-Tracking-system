const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

router.get("/", doctorController.getAllDoctors); // ดึงข้อมูลทั้งหมด
router.get("/:id", doctorController.getDoctorById); // ดึงข้อมูลแพทย์ตาม ID
router.post("/", doctorController.createDoctor); // สร้างข้อมูลแพทย์ใหม่
router.put("/:id", doctorController.updateDoctor); // อัพเดตข้อมูลแพทย์
router.delete("/:id", doctorController.deleteDoctor); // ลบข้อมูลแพทย์

module.exports = router;
