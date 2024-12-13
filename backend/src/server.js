const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const knex = require("knex");
require("dotenv").config();

// ตั้งค่าการเชื่อมต่อฐานข้อมูลด้วย Knex.js
const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Routes
app.use("/api/auth", authRoutes); // Route สำหรับ login
app.use("/api/staff", staffRoutes); // Route สำหรับ staff

const startServer = async () => {
  try {
    await db.raw("SELECT 1+1 AS result");
    console.log("Database connected successfully");

    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
