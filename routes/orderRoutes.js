const router = require("express").Router();
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");

const {
  placeOrder,
  getMyOrders,
  getMyOrderedProducts,
  trackOrder,
  getOrderById,
  cancelOrder,
  getCheckoutSummary
} = require("../controllers/orderController");

router.post("/", verifyTokenMiddleware, placeOrder);
router.post("/checkout-summary", verifyTokenMiddleware,getCheckoutSummary);
router.get("/", verifyTokenMiddleware, getMyOrders);
router.get("/my-products", verifyTokenMiddleware, getMyOrderedProducts);
router.get("/track/:orderId", verifyTokenMiddleware, trackOrder);
router.get("/:orderId", verifyTokenMiddleware, getOrderById);
router.put("/:orderId/cancel", verifyTokenMiddleware, cancelOrder);
module.exports = router;
