const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const db = require("./config/database.js");

// Import routes
const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes");
const caseRoutes = require("./routes/caseRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const linkCaseRoutes = require("./routes/linkCaseRoutes");
const patientRoutes = require("./routes/patientRoutes");
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Routes
app.get("/dd", (req, res) => res.json("KUYYY"));
app.use("/api/auth", authRoutes); // Route สำหรับ login
app.use("/api/staff", staffRoutes); // Route สำหรับ staff
app.use("/api/surgery_case", caseRoutes); // Route สำหรับ Case
app.use("/api/doctor", doctorRoutes); // Route สำหรับ Doctor
app.use("/api/link_cases", linkCaseRoutes); // Route สำหรับ link
app.use("/api/patient", patientRoutes); // Route สำหรับ patient

const startServer = async () => {
  try {
    await db.raw("SELECT 1+1 AS result");
    console.log("Database connected successfully");

    app.listen(3000, () => {
      console.log(
        "Server is running on host:",
        db.client.config.connection.host
      );
      console.log("Database :", db.client.config.connection.database);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
