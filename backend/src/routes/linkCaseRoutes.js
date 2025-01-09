const express = require("express");
const router = express.Router();
const linkCaseController = require("../controllers/linkCaseController");

router.get("/", linkCaseController.getAllLinkCases);
router.get("/:id", linkCaseController.getLinkCaseById);
router.post("/", linkCaseController.createLinkCase);
router.put("/:id", linkCaseController.updateLinkCase);
router.put("/:id/expiration", linkCaseController.updateLinkCaseExpiration);
router.patch("/update_status", linkCaseController.updateLinkCaseStatus);
router.get(
  "/getLast/:surgery_case_id",
  linkCaseController.getLatestActiveLinkCaseBySurgeryCaseId
);
router.get(
  "/check_reviews/:surgery_case_id",
  linkCaseController.checkReviewStatus
);
router.post("/submit_review", linkCaseController.submitReview);

module.exports = router;
