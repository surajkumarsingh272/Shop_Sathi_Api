const express = require("express");
const router = express.Router();
const mobileController = require("../controllers/mobileController");

router.get("/mobile/:id", mobileController.getMobileDetails);
module.exports = router;
