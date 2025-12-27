const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/razorpayController");

router.post("/create-order", paymentController.createPaymentOrder);
router.post("/verify-payment", paymentController.verifyPayment);

module.exports = router;
