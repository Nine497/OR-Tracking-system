const linkCase = require("../models/linkCaseModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const linkCaseController = {
  // ดึงข้อมูลทั้งหมด
  getAllLinkCases: async (req, res) => {
    try {
      const data = await linkCase.getAllLinkCase();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching link cases", error });
    }
  },

  // ดึงข้อมูลตาม ID
  getLinkCaseById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await linkCase.getLinkById(id);
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(200).json({ message: "Link case not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching link case", error });
    }
  },

  // สร้างข้อมูลใหม่
  createLinkCase: async (req, res) => {
    const { surgery_case_id, expiration_time, created_by } = req.body;
    if (!surgery_case_id || !expiration_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const created_at = new Date();
    const isactive = true;

    const expirationTimeWithoutTimezone = new Date(expiration_time)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const createdAtWithoutTimezone = new Date(created_at)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const payload = {
      surgery_case_id: surgery_case_id,
    };

    const secretKey = process.env.JWT_SECRET_KEY;

    const token = jwt.sign(payload, secretKey, { algorithm: "HS256" });

    const urlSafeToken = token
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const linkCaseData = {
      surgery_case_id,
      created_at: createdAtWithoutTimezone,
      created_by,
      isactive,
      jwt_token: urlSafeToken,
      expiration_time: expirationTimeWithoutTimezone,
    };

    console.log("CREATE DATA : ", linkCaseData);
    try {
      const newLink = await linkCase.createLink(linkCaseData);
      res.status(201).json(newLink);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // อัปเดตข้อมูล
  updateLinkCase: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await linkCase.updateLink(id, updateData);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error updating link case", error });
    }
  },

  getLatestActiveLinkCaseBySurgeryCaseId: async (req, res) => {
    try {
      const { surgery_case_id } = req.params;

      const data = await linkCase.getLatestActiveLinkCaseBySurgeryCaseId(
        surgery_case_id
      );

      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({
          message:
            "Active link case not found for the provided surgery_case_id",
        });
      }
    } catch (error) {
      console.error("Error fetching latest active link case: ", error);
      res.status(500).json({
        message: "Error fetching latest active link case by surgery_case_id",
        error: error.message,
      });
    }
  },
};

module.exports = linkCaseController;
