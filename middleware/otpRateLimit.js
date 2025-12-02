const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,
  message: { success: false, message: "Too many OTP requests" },
});

module.exports = otpLimiter;
