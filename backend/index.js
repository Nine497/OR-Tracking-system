const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const db = require("./src/config/database.js");
const functions = require("firebase-functions");

// Import routes
const authRoutes = require("./src/routes/authRoutes.js");
const staffRoutes = require("./src/routes/staffRoutes.js");
const caseRoutes = require("./src/routes/caseRoutes.js");
const doctorRoutes = require("./src/routes/doctorRoutes.js");
const linkCaseRoutes = require("./src/routes/linkCaseRoutes.js");
const patientRoutes = require("./src/routes/patientRoutes.js");
const or_roomRoutes = require("./src/routes/operatingRoomRoutes.js");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/surgery_case", caseRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/link_cases", linkCaseRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/or_room", or_roomRoutes);
app.use;
app.use("/api/getTest", (req, res) => {
  res.send("Respond From API Successfully");
});
app.post("/api/newSurgeryCase", (req, res) => { });

// Start server
const port = process.env.PORT_NUMBER || 3001;

db.raw("SELECT 1+1 AS result")
  .then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  });

// Firebase Functions
// exports.api = functions.https.onRequest({ region: "asia-southeast1" }, app);
