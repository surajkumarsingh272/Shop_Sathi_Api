const router = require("express").Router();
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");

const {
  placeOrder,
  getMyOrders,
  getMyOrderedProducts,
  trackOrder,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

router.post("/", verifyTokenMiddleware, placeOrder);
router.get("/", verifyTokenMiddleware, getMyOrders);
router.get("/my-products", verifyTokenMiddleware, getMyOrderedProducts);
router.get("/track/:orderId", verifyTokenMiddleware, trackOrder);
router.get("/:orderId", verifyTokenMiddleware, getOrderById);
router.put("/:orderId/cancel", verifyTokenMiddleware, cancelOrder);
module.exports = router;
