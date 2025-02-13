const linkCase = require("../models/linkCaseModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../config/database");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

require("dotenv").config();
dayjs.extend(utc);
dayjs.extend(timezone);

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
    const { surgery_case_id, expiration_time, created_by } = req.body;

    if (!surgery_case_id || !expiration_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const created_at = dayjs().utc().format();
    const timestamp = Date.now();
    const randomValue = crypto.randomInt(0, 1000);
    const surgery_case_links_id = `${timestamp}${randomValue}`;

    try {
      const pin = crypto.randomInt(100000, 999999).toString();

      const cipher = crypto.createCipheriv(
        "aes-128-cbc",
        Buffer.from(process.env.SECRET_KEY, "hex"),
        Buffer.from(process.env.IV, "hex")
      );
      let encryptedPin = cipher.update(pin, "utf8", "base64");
      encryptedPin += cipher.final("base64");

      const hash = await bcrypt.hash(surgery_case_links_id, 10);
      const cleanHash = hash.replace(/[^\w\s]/g, "");

      const isactive = true;

      const expirationTimeUtc = dayjs(expiration_time).utc().format();

      const linkCaseData = {
        surgery_case_links_id: cleanHash,
        surgery_case_id,
        created_at,
        created_by,
        isactive,
        expiration_time: expirationTimeUtc,
        pin_encrypted: encryptedPin,
      };

      const newLink = await linkCase.createLink(linkCaseData);

      res.status(201).json({
        ...newLink,
        pin: pin,
      });
    } catch (error) {
      console.error("Error creating link case:", error);
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
      console.log("Get Link Data By Case ID : ", surgery_case_id);

      const data = await linkCase.getLatestActiveLinkCaseBySurgeryCaseId(
        surgery_case_id
      );

      if (!data) {
        return res.status(404).json({
          message:
            "Active link case not found for the provided surgery_case_id",
        });
      }

      let pin_decrypted = null;

      try {
        if (data.pin_encrypted) {
          console.log("Encrypted PIN:", data.pin_encrypted);

          const key = Buffer.from(process.env.SECRET_KEY, "hex");
          const iv = Buffer.from(process.env.IV, "hex");

          if (key.length !== 16 || iv.length !== 16) {
            throw new Error(
              "Invalid SECRET_KEY or IV length. Must be 16 bytes."
            );
          }

          const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

          let decryptedPin = decipher.update(
            data.pin_encrypted,
            "base64",
            "utf8"
          );
          decryptedPin += decipher.final("utf8");

          pin_decrypted = decryptedPin;
        }
      } catch (err) {
        console.error(
          "Error decrypting PIN for case ID:",
          surgery_case_id,
          err
        );
      }

      const responseData = {
        ...data,
        pin_decrypted,
      };

      res.status(200).json(responseData);
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

      const formattedExpirationTime = dayjs(expiration_time)
        .utc()
        .format("YYYY-MM-DD HH:mm:ss");

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

  checkReviewStatus: async (req, res) => {
    const { surgery_case_id } = req.params;

    try {
      const reviewExists = await db("link_reviews")
        .where("surgery_case_id", surgery_case_id)
        .first();

      res.status(200).json({
        reviewExists: !!reviewExists,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Error checking review status",
        error: err.message,
      });
    }
  },

  submitReview: async (req, res) => {
    const { surgery_case_id, review_text, rating } = req.body;

    try {
      const newReview = await linkCase.createReview(
        surgery_case_id,
        review_text,
        rating
      );

      res.status(200).json({
        message: "Review submitted successfully",
        review: newReview,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  acceptTerms: async (req, res) => {
    try {
      const { surgery_case_links_id } = req.params;
      const timeStamp = new Date();
      const result = await db("surgery_case_links")
        .where("surgery_case_links_id", surgery_case_links_id)
        .update({ accepted_terms: timeStamp })
        .returning("*");

      if (result && result.length > 0) {
        res.status(200).send("Terms accepted");
      } else {
        res.status(400).send("Failed to accept terms");
      }
    } catch (error) {
      console.error("Error updating terms:", error);
      res.status(500).send("Error updating terms");
    }
  },
};

module.exports = linkCaseController;
