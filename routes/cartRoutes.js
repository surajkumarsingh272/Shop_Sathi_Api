const express = require("express");
const cartController = require("../controllers/cartController"); 
const router = express.Router(); 
router.use(express.json());
router.post("/add", cartController.addToCart);
router.get("/:user_id", cartController.getCart);
router.put("/update", cartController.updateCartQuantity);
router.delete("/remove/:cart_id", cartController.removeFromCart);

module.exports = router;
