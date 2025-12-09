const express = require("express");
const router = express.Router();
const shop = require("../controllers/shopController");


router.post("/address/add", shop.addAddress);
router.get("/address/default/:user_id", shop.getDefaultAddress);

router.post("/order/create", shop.createOrder);

// router.post("/payment/create-order", shop.createPaymentOrder);
// router.post("/payment/verify", shop.verifyPayment);

module.exports = router;
