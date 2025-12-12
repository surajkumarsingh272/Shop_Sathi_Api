
const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

router.post("/add", addressController.addAddress);
router.get("/all/:user_id", addressController.getAddresses);
router.put("/update/:id", addressController.updateAddress);
router.delete("/delete/:id", addressController.deleteAddress);
router.post("/set-default", addressController.setDefaultAddress);

module.exports = router;
