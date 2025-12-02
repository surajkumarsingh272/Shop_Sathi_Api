const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const otpLimiter = require("../middleware/otpRateLimit");

router.post("/register", otpLimiter, authController.register);

router.post("/verify-otp", authController.verifyOtp);

router.post("/login", authController.login);

router.post("/forgot-password", otpLimiter, authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

router.post("/refresh-token", authController.refreshToken);

router.get("/profile", authController.profile);

router.post("/logout", authController.logout);

module.exports = router;
