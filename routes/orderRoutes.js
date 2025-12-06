const router = require("express").Router();
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");
const { getMyOrders, trackOrder } = require("../controllers/orderController");


router.get("/", verifyTokenMiddleware, getMyOrders);
router.get("/track/:orderId", verifyTokenMiddleware, trackOrder);

module.exports = router;
