const Staff = require("../models/staffModel");
const bcrypt = require("bcrypt");
const db = require("../config/database");

// Search & getAllStaff Staff table
exports.getAllStaff = async (req, res) => {
  try {
    const { search, limit = 6, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    let totalRecords;
    let staff;

    if (search) {
      const lowerSearch = `%${search.trim().toLowerCase()}%`;

      const totalQuery = await db("staff")
        .count("* as total")
        .whereRaw('LOWER(CAST("staff_id" AS text)) LIKE ?', [lowerSearch])
        .orWhereRaw('LOWER("username") LIKE ?', [lowerSearch])
        .orWhereRaw('LOWER("firstname") LIKE ?', [lowerSearch])
        .orWhereRaw('LOWER("lastname") LIKE ?', [lowerSearch]);
      totalRecords = totalQuery[0].total;

      staff = await db("staff")
        .select("*")
        .whereRaw('LOWER(CAST("staff_id" AS text)) LIKE ?', [lowerSearch])
        .orWhereRaw('LOWER("username") LIKE ?', [lowerSearch])
        .orWhereRaw('LOWER("firstname") LIKE ?', [lowerSearch])
        .orWhereRaw('LOWER("lastname") LIKE ?', [lowerSearch])
        .orderBy("staff_id", "asc")
        .limit(Number(limit))
        .offset(offset);
    } else {
      const totalQuery = await db("staff").count("* as total");
      totalRecords = totalQuery[0].total;

      staff = await db("staff")
        .select("*")
        .orderBy("staff_id", "asc")
        .limit(Number(limit))
        .offset(offset);
    }

    res.status(200).json({
      data: staff,
      totalRecords,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new staff
exports.createStaff = async (req, res) => {
  let {
    username,
    password,
    firstname,
    lastname,
    isActive = true,
    created_by,
  } = req.body;

  try {
    if (!username || !password || !firstname || !lastname || !created_by) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    username = username.replace(/[A-Za-z]/g, (match) => match.toLowerCase());

    const existingUser = await Staff.findOne({ username: username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await Staff.create({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      isActive,
      created_at: new Date().toISOString(),
      created_by,
    });

    if (!newStaff) {
      return res.status(500).json({ message: "Failed to create staff" });
    }

    const staffData = {
      staff_id: newStaff.staff_id,
      username: newStaff.username,
      firstname: newStaff.firstname,
      lastname: newStaff.lastname,
      isActive: newStaff.isActive,
      created_at: newStaff.created_at,
      created_by: newStaff.created_by,
    };

    console.log(staffData);
    res.status(201).json(staffData);
  } catch (err) {
    console.error("Error creating staff:", err);
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

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Staff.getAllPermissions();
    res.json({ permissions });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ message: "Error fetching permissions" });
  }
};

exports.updatePermissions = async (req, res) => {
  const { staff_id } = req.params;
  const { permission_ids, gived_by, gived_at } = req.body;
  try {
    console.log(staff_id);

    if (!permission_ids || permission_ids.length === 0) {
      await Staff.updatePermissions(staff_id, [], gived_by, gived_at);
    } else {
      await Staff.updatePermissions(
        staff_id,
        permission_ids,
        gived_by,
        gived_at
      );
    }

    res.json({ message: "Permissions updated successfully" });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ message: "Error updating permissions" });
  }
};

exports.updateStaffActive = async (req, res) => {
  const { staff_id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "Invalid isActive value" });
  }

  try {
    const result = await db("staff").where({ staff_id }).update({ isActive });

    if (result) {
      res.status(200).json({ message: "Staff status updated successfully" });
    } else {
      res.status(404).json({ message: "Staff not found" });
    }
  } catch (error) {
    console.error("Error updating staff status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
