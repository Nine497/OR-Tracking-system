const Doctor = require("../models/doctorModel");

// ฟังก์ชันสำหรับดึงข้อมูลหมอทั้งหมด
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.getAllDoctors();
    res.status(200).json({
      data: doctors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลหมอโดย id
exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.getDoctorById(id);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }
    res.status(200).json({
      data: doctor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ฟังก์ชันสำหรับเพิ่มข้อมูลหมอใหม่
exports.createDoctor = async (req, res) => {
  const doctorData = req.body;
  try {
    const newDoctor = await Doctor.createDoctor(doctorData);
    res.status(201).json({
      message: "Doctor created successfully",
      data: newDoctor[0], // เนื่องจากการ insert จะ return แค่ array
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ฟังก์ชันสำหรับอัปเดตข้อมูลหมอ
exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  const doctorData = req.body;
  try {
    const updatedDoctor = await Doctor.updateDoctor(id, doctorData);
    if (!updatedDoctor[0]) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }
    res.status(200).json({
      message: "Doctor updated successfully",
      data: updatedDoctor[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ฟังก์ชันสำหรับลบข้อมูลหมอ
exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDoctor = await Doctor.deleteDoctor(id);
    if (!deletedDoctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }
    res.status(200).json({
      message: "Doctor deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
