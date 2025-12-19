const express = require("express");
const router = express.Router();
const ratingReviewController = require("../controllers/ratingReviewController");
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");

router.post("/add", verifyTokenMiddleware, ratingReviewController.addReview);//
router.get("/product/:productId", ratingReviewController.getReviewsByProduct);//
router.put("/update/:reviewId", verifyTokenMiddleware, ratingReviewController.updateReview);//
router.delete("/delete/:reviewId", verifyTokenMiddleware, ratingReviewController.deleteReview);//
router.get("/has-reviewed/:productId", verifyTokenMiddleware, ratingReviewController.hasUserReviewed);//
router.get("/summary/:productId", ratingReviewController.getRatingSummary);//
router.get("/review-summary/:productId", ratingReviewController.getReviewSummary);
module.exports = router;
