const express = require("express");
const router = express.Router();
const upload = require("../utils/upload_images");

const homeController = require("../controllers/homeController");

// Banners
router.get("/banners", homeController.getBanners);
router.post("/banners", upload.single("image"), homeController.addBanner);

// Categories
router.get("/categories", homeController.getCategories);

// Top Products
router.get("/top-products", homeController.getTopProducts);

// New Products
router.get("/new-products", homeController.getNewProducts);

module.exports = router;
