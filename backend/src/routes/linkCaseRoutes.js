const express = require("express");
const router = express.Router();
const linkCaseController = require("../controllers/linkCaseController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/:id", linkCaseController.getLinkCaseById);
router.get("/", linkCaseController.getAllLinkCases);
router.post("/", verifyToken, linkCaseController.createLinkCase);
router.put("/:id", verifyToken, linkCaseController.updateLinkCase);
router.put(
  "/:id/expiration",
  verifyToken,
  linkCaseController.updateLinkCaseExpiration
);
router.patch(
  "/update_status",
  verifyToken,
  linkCaseController.updateLinkCaseStatus
);
router.get(
  "/getLast/:surgery_case_id",
  linkCaseController.getLatestActiveLinkCaseBySurgeryCaseId
);
router.get(
  "/check_reviews/:surgery_case_id",
  linkCaseController.checkReviewStatus
);
router.post("/submit_review", linkCaseController.submitReview);
router.post(
  "/accept_terms/:surgery_case_links_id",
  linkCaseController.acceptTerms
);
module.exports = router;
