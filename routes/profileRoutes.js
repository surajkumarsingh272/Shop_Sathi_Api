const express = require("express");
const router = express.Router();
const { getMyProfile, updateProfile } = require("../controllers/profileController");
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");
const upload=require("../utils/upload_images");

// ✔ Correct routes
router.get("/", verifyTokenMiddleware, getMyProfile);
// router.put("/", verifyTokenMiddleware, updateProfile);
router.put(
  "/",
  verifyTokenMiddleware,
  upload.single("profile_image"),  
  updateProfile
);


module.exports = router;
