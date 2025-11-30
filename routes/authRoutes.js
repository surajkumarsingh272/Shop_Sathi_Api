const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const otpLimiter = require("../middleware/otpRateLimit");
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");

// Register (with otpLimiter)
router.post("/register", otpLimiter, authController.register);

// Verify OTP
router.post("/verify-otp", authController.verifyOtp);

// Login
router.post("/login", authController.login);

// Forgot Password (otpLimiter)
router.post("/forgot-password", otpLimiter, authController.forgotPassword);

// Reset Password
router.post("/reset-password", authController.resetPassword);

// Refresh Token
router.post("/refresh-token", authController.refreshToken);

// Profile (keeps same behavior as original - expects Authorization header)
router.get("/profile", authController.profile);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
