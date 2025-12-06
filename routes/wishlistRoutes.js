const router = require("express").Router();
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");
const { getWishlist ,addToWishlist,removeFromWishlist} = require("../controllers/wishlistController");
// GET /wishlist/:userId  -> user ka wishlist fetch
router.get("/:userId", verifyTokenMiddleware, getWishlist);

// POST /wishlist  -> add product to wishlist
router.post("/", verifyTokenMiddleware, addToWishlist);

// DELETE /wishlist/:wishlistId -> remove specific wishlist item
router.delete("/:wishlistId", verifyTokenMiddleware, removeFromWishlist);

module.exports = router;
