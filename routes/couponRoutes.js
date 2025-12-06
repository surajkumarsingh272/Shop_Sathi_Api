const router = require("express").Router();
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");
const { getCoupons } = require("../controllers/couponController");

router.get("/", verifyTokenMiddleware, getCoupons);

module.exports = router;
