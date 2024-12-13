// staffController.js

const Staff = require("../models/staffModel");
const bcrypt = require("bcrypt");

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.getAll();
    res.status(200).json(staff);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new staff
exports.createStaff = async (req, res) => {
  const { username, password, firstname, lastname, isActive } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await Staff.create({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      isActive,
      created_at: new Date(),
    });

    res.status(201).json(newStaff);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get permissions by staff_id
exports.getPermissionsByStaffId = async (req, res) => {
  const { staffId } = req.params;

  try {
    const permissions = await Staff.getPermissionsByStaffId(staffId);

    if (permissions.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(permissions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { username, password, firstname, lastname, isActive } = req.body;

  try {
    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const updatedStaff = await Staff.update(id, {
      username,
      password,
      firstname,
      lastname,
      isActive,
    });

    res.status(200).json(updatedStaff);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Active Status of Staff
exports.updateActiveStaff = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res
      .status(400)
      .json({ message: "Invalid value for isActive. Must be true or false." });
  }

  try {
    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const updatedStaff = await Staff.updateStatus(id, isActive);

    res.status(200).json({
      message: `Staff has been ${isActive ? "activated" : "deactivated"}`,
      staff: updatedStaff,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
