const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route สำหรับ login
router.post("/login", authController.login);

module.exports = router;
