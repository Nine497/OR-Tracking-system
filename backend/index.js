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

// Start server locally
if (process.env.NODE_ENV === "development") {
  const startServer = async () => {
    try {
      const port = 3000 || process.env.PORT_NUMBER;
      await db.raw("SELECT 1+1 AS result");
      console.log("Database connected successfully");

      app.listen(port, () => {
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
}

// Firebase Functions
exports.api = functions.https.onRequest({ region: "asia-southeast1" }, app);
