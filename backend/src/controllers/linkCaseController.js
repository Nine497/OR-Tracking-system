const linkCase = require("../models/linkCaseModel");
const bcrypt = require("bcryptjs");
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

  createLinkCase: async (req, res) => {
    console.log(req.body);
    const { surgery_case_id, expiration_time, created_by } = req.body;

    if (!surgery_case_id || !expiration_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const created_at = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    });

    const timestamp = Date.now();
    const randomValue = Math.floor(Math.random() * 1000);
    const surgery_case_links_id = `${timestamp}${randomValue}`;
    const saltRounds = 10;

    try {
      const hash = await bcrypt.hash(surgery_case_links_id, saltRounds);
      const cleanHash = hash.replace(/[^\w\s]/g, "");

      const isactive = true;

      const linkCaseData = {
        surgery_case_links_id: cleanHash,
        surgery_case_id,
        created_at: created_at,
        created_by,
        isactive,
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

  updateLinkCaseExpiration: async (req, res) => {
    try {
      const { id } = req.params;
      const { expiration_time } = req.body;

      const link = await linkCase.getLinkById(id);
      if (!link) {
        return res.status(404).json({ message: "Link case not found" });
      }

      const formattedExpirationTime = new Date(expiration_time).toLocaleString(
        "en-US",
        {
          timeZone: "Asia/Bangkok",
        }
      );

      const updatedLink = await linkCase.updateLink(id, {
        expiration_time: formattedExpirationTime,
      });

      if (updatedLink.length > 0) {
        return res.status(200).json({
          message: "Link case expiration time updated successfully",
          data: updatedLink[0],
        });
      } else {
        throw new Error("Failed to update expiration time");
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = linkCaseController;
