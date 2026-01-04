const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/razorpayController");
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");

router.post("/create-order", verifyTokenMiddleware, paymentController.createPaymentOrder);
router.post("/verify-payment", verifyTokenMiddleware, paymentController.verifyPayment);

module.exports = router;