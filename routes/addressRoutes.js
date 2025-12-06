const router = require("express").Router();
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");
const { getAddresses } = require("../controllers/addressController");

router.get("/", verifyTokenMiddleware, getAddresses);

module.exports = router;
