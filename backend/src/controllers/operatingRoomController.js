// controllers/operatingRoomController.js
const OperatingRoom = require("../models/operatingRoomModel");
const db = require("../config/database");
const OperatingRoomController = {
  getAllOperatingRooms: async (req, res) => {
    try {
      const operatingRooms = await OperatingRoom.getAll();
      res.status(200).json({
        message: "Operating rooms fetched successfully",
        data: operatingRooms,
      });
    } catch (error) {
      console.error("Error fetching operating rooms:", error);
      res.status(500).json({
        message: "Error fetching operating rooms",
        error: error.message,
      });
    }
  },

  getOperatingRoomById: async (req, res) => {
    const { id } = req.params;
    try {
      const operatingRoom = await OperatingRoom.getById(id);
      if (!operatingRoom) {
        return res.status(404).json({
          message: `Operating room with ID ${id} not found`,
        });
      }
      res.status(200).json({
        message: "Operating room fetched successfully",
        data: operatingRoom,
      });
    } catch (error) {
      console.error("Error fetching operating room:", error);
      res.status(500).json({
        message: "Error fetching operating room",
        error: error.message,
      });
    }
  },

  createOperatingRoom: async (req, res) => {
    const { room_name, room_type, location, isactive } = req.body;

    // ตรวจสอบข้อมูลก่อนจะทำการสร้าง
    if (!room_name || !room_type || !location) {
      return res.status(400).json({
        message: "Please provide room_name, room_type, and location",
      });
    }

    const newOperatingRoomData = {
      room_name,
      room_type,
      location,
      isactive: isactive !== undefined ? isactive : true,
      created_at: new Date(),
    };

    try {
      const newOperatingRoom = await OperatingRoom.create(newOperatingRoomData);
      res.status(201).json({
        message: "Operating room created successfully",
        data: newOperatingRoom,
      });
    } catch (error) {
      console.error("Error creating operating room:", error);
      res.status(500).json({
        message: "Error creating operating room",
        error: error.message,
      });
    }
  },

  updateOperatingRoom: async (req, res) => {
    const { id } = req.params;
    const { room_name, room_type, location, isactive } = req.body;

    // ตรวจสอบข้อมูลก่อนจะทำการอัพเดต
    if (!room_name || !room_type || !location) {
      return res.status(400).json({
        message: "Please provide room_name, room_type, and location",
      });
    }

    const updatedOperatingRoomData = {
      room_name,
      room_type,
      location,
      isactive: isactive !== undefined ? isactive : true,
    };

    try {
      const updatedOperatingRoom = await OperatingRoom.update(
        id,
        updatedOperatingRoomData
      );
      if (!updatedOperatingRoom) {
        return res.status(404).json({
          message: `Operating room with ID ${id} not found`,
        });
      }
      res.status(200).json({
        message: "Operating room updated successfully",
        data: updatedOperatingRoom,
      });
    } catch (error) {
      console.error("Error updating operating room:", error);
      res.status(500).json({
        message: "Error updating operating room",
        error: error.message,
      });
    }
  },

  deleteOperatingRoom: async (req, res) => {
    const { id } = req.params;
    try {
      const deletedRows = await OperatingRoom.delete(id);
      if (deletedRows === 0) {
        return res.status(404).json({
          message: `Operating room with ID ${id} not found`,
        });
      }
      res.status(200).json({
        message: "Operating room deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting operating room:", error);
      res.status(500).json({
        message: "Error deleting operating room",
        error: error.message,
      });
    }
  },
};

module.exports = OperatingRoomController;
