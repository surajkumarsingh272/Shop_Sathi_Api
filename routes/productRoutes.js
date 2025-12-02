const express = require("express");
const router = express.Router();
router.use(express.json());
const productController = require("../controllers/productController");
const upload = require("../utils/upload_images");
const cartController = require("../controllers/cartController");


router.get("/home-products", productController.homeProducts);

router.get("/categories", productController.categories);

router.get("/product-screen", productController.productScreen);

router.post("/upload", upload.single("image"), productController.uploadImage);

router.post("/add-product", upload.single("image"), productController.addProduct);
router.delete("/delete-product/:id", productController.deleteProduct);

router.get("/product/:id", productController.getProductById);

router.get("/product/:id/colors", productController.getProductColors);

router.get("/product/:id/sizes", productController.getProductSizes);

router.get("/product/:id/images", productController.getProductImages);

router.get("/product/:id/offers", productController.getProductOffers);

router.get("/product/:id/highlights", productController.getProductHighlights);

router.get("/reviews/:product_id", productController.getProductReviews);

router.get("/rating/:product_id", productController.getProductRating);

router.get("/product/:id/category", productController.getProductCategory);

router.get("/api/products/:id/description", productController.getProductDescription);

router.get("/product-status", productController.productStatusList);
router.get("/history/:user_id", productController.purchaseHistory);

router.post("/wishlist/add", productController.addToWishlist);
router.get("/wishlist/:user_id", productController.getWishlist);
router.delete("/wishlist/remove", productController.removeFromWishlist);











////suraj kumar singh//

router.post("/add-category", productController.addCategory);

router.post("/product/:id/add-color", productController.addProductColor);

router.post("/product/:id/add-description", productController.addProductDescription);

router.post("/product/:id/add-image", upload.single("image"), productController.addProductImage);

router.post("/product/:id/add-offer", productController.addProductOffer);

router.post("/product/:id/add-rating", productController.addProductRating);

router.post("/product/:id/add-review", productController.addProductReview);

router.post("/product/:id/add-size", productController.addProductSize);

router.post("/add-recent-search", productController.addRecentSearch);


module.exports = router;
