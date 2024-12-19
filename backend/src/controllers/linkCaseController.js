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

  // Token Creation
  createLinkCase: async (req, res) => {
    const { surgery_case_id, expiration_time, created_by } = req.body;
    if (!surgery_case_id || !expiration_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const created_at = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    });
    const isactive = true;

    try {
      const payload = {
        surgery_case_id: surgery_case_id,
        exp: Math.floor(new Date(expiration_time).getTime() / 1000),
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        algorithm: "HS256",
      });

      const urlSafeToken = token
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const linkCaseData = {
        surgery_case_id,
        created_at: created_at,
        created_by,
        isactive,
        jwt_token: urlSafeToken,
        expiration_time: new Date(expiration_time).toLocaleString("en-US", {
          timeZone: "Asia/Bangkok",
        }),
      };

      const newLink = await linkCase.createLink(linkCaseData);
      res.status(201).json(newLink);
    } catch (error) {
      console.error("Error creating token:", error);
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

  // อัปเดต isactive ตาม surgery_case_links_id
  updateLinkCaseStatus: async (req, res) => {
    try {
      const { surgery_case_links_id, isactive } = req.body;

      if (!surgery_case_links_id || isactive === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await linkCase.updateLinkStatus(
        surgery_case_links_id,
        isactive
      );

      if (result) {
        res.status(200).json({
          message: "Link case status updated successfully",
          data: result,
        });
      } else {
        res.status(404).json({
          message: "Link case not found or failed to update status",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating link case status", error });
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
