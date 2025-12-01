const express = require("express");
const router = express.Router();
router.use(express.json());
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
// router.post("/add-product", productController.addProduct);
router.post("/add-product", upload.single("image"), productController.addProduct);
router.delete("/delete-product/:id", productController.deleteProduct);

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

////suraj kumar singh//

// Categories
router.post("/add-category", productController.addCategory);

// Product Colors
router.post("/product/:id/add-color", productController.addProductColor);

// Product Descriptions (Multi-language)
router.post("/product/:id/add-description", productController.addProductDescription);

// Product Images
router.post("/product/:id/add-image", upload.single("image"), productController.addProductImage);

// Product Offers
router.post("/product/:id/add-offer", productController.addProductOffer);

// Product Ratings
router.post("/product/:id/add-rating", productController.addProductRating);

// Product Reviews
router.post("/product/:id/add-review", productController.addProductReview);

// Product Sizes
router.post("/product/:id/add-size", productController.addProductSize);

// Recent searches
router.post("/add-recent-search", productController.addRecentSearch);


module.exports = router;
