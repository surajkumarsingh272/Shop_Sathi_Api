const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/jwt");

function verifyTokenMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ success: false, message: "Access token required" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "Access token required" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    console.log("Decoded User:", decoded); 
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
module.exports = { verifyTokenMiddleware };

