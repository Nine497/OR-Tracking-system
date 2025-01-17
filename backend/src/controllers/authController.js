const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Staff = require("../models/staffModel");
require("dotenv").config();

exports.login = async (req, res) => {
  let { username, password } = req.body;

  try {
    username = username.replace(/[A-Za-z]/g, (match) => match.toLowerCase());

    const staff = await Staff.findOne({ username });

    if (!staff) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!staff.isActive) {
      return res.status(403).json({ message: "Your account is inactive" });
    }

    const token = jwt.sign(
      {
        id: staff.staff_id,
        username: staff.username,
        firstname: staff.firstname,
        lastname: staff.lastname,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        staff_id: staff.staff_id,
        username: staff.username,
        firstname: staff.firstname,
        lastname: staff.lastname,
        isActive: staff.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
