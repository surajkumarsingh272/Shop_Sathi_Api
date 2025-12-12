const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const otpLimiter = require("../middleware/otpRateLimit");
const upload=require('../utils/upload_images')

// router.post("/register", upload.single("profile_image"),otpLimiter, authController.register);
router.post("/register", upload.single("profile_image"), authController.register);

router.post("/verify-otp", authController.verifyOtp);

router.post("/login", authController.login);

router.post("/forgot-password", otpLimiter, authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

router.post("/refresh-token", authController.refreshToken);

router.get("/profile", authController.profile);

router.post("/logout", authController.logout);

module.exports = router;
