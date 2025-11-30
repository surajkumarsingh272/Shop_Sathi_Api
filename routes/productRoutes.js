const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const upload = require("../utils/upload_images");

// Home products
router.get("/home-products", productController.homeProducts);

// Categories
router.get("/categories", productController.categories);

// Product screen
router.get("/product-screen", productController.productScreen);

// Upload
router.post("/upload", upload.single("image"), productController.uploadImage);

// Add product
router.post("/add-product", productController.addProduct);

// Product by id
router.get("/product/:id", productController.getProductById);

// Product colors
router.get("/product/:id/colors", productController.getProductColors);

// Product sizes
router.get("/product/:id/sizes", productController.getProductSizes);

// Product images
router.get("/product/:id/images", productController.getProductImages);

// Product offers
router.get("/product/:id/offers", productController.getProductOffers);

// Product highlights
router.get("/product/:id/highlights", productController.getProductHighlights);

// Reviews
router.get("/reviews/:product_id", productController.getProductReviews);

// Rating
router.get("/rating/:product_id", productController.getProductRating);

// Product category
router.get("/product/:id/category", productController.getProductCategory);

// Product description route (kept same path)
router.get("/api/products/:id/description", productController.getProductDescription);

module.exports = router;
