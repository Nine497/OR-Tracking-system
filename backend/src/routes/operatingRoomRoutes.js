const express = require("express");
const router = express.Router();
const OperatingRoomController = require("../controllers/operatingRoomController");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

router.get("/", OperatingRoomController.getAllOperatingRooms); 
router.get("/:id", OperatingRoomController.getOperatingRoomById); 
router.post("/", OperatingRoomController.createOperatingRoom); 
router.put("/:id", OperatingRoomController.updateOperatingRoom); 
router.delete("/:id", OperatingRoomController.deleteOperatingRoom); 

module.exports = router;
