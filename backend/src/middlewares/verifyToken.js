const jwt = require("jsonwebtoken");
const db = require("../config/database");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try { 
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;

    const user = await db("staff").where("staff_id", decoded.id).first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    next();
  } catch (err) {
    console.error("Error verifying token:", err.message);

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res
      .status(500)
      .json({ message: "An error occurred while verifying token" });
  }
};

module.exports = verifyToken;
