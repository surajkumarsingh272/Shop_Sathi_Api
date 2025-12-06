const router = require("express").Router();
const { verifyTokenMiddleware } = require("../middleware/authMiddleware");
const { sendSupportMessage } = require("../controllers/supportController");

router.post("/", verifyTokenMiddleware, sendSupportMessage);

module.exports = router;
