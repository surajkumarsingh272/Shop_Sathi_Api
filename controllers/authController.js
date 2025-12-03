const db = require("../config/db");
const client = require("../config/twilio");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/jwt");

exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.json({ success: false, message: "All fields required" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

    if (rows.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await db.query(
      "INSERT INTO users(name,email,phone,password,is_verified) VALUES(?,?,?,?,0)",
      [name, email, phone, hashedPassword]
    );

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({ to: "+91" + phone, channel: "sms" });

    res.json({
      success: true,
      message: "OTP sent to your phone. Please verify.",
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};


exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp)
    return res.json({ success: false, message: "Phone & OTP required" });

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: "+91" + phone, code: otp });

    if (verification.status !== "approved")
      return res.json({ success: false, message: "Invalid OTP" });

    await db.query("UPDATE users SET is_verified=1 WHERE phone=?", [phone]);

    const [rows] = await db.query("SELECT * FROM users WHERE phone=?", [phone]);

    if (rows.length === 0)
      return res.json({ success: false, message: "User not found" });

    const user = rows[0];

    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "7d" });

    await db.query("UPDATE users SET refresh_token=? WHERE id=?", [refreshToken, user.id]);

    res.json({
      success: true,
      message: "Phone verified. Account activated!",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.json({ success: false, message: "Email & Password required" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

    if (rows.length === 0)
      return res.json({ success: false, message: "User not found" });

    const user = rows[0];

    // if (user.is_verified === 0)
    //   return res.json({ success: false, message: "Please verify OTP first" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.json({ success: false, message: "Invalid password" });

    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "7d" });

    await db.query("UPDATE users SET refresh_token=? WHERE id=?", [refreshToken, user.id]);

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.json({ success: false, message: "Phone required" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE phone=?", [phone]);

    if (rows.length === 0)
      return res.json({ success: false, message: "User not found" });

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({ to: "+91" + phone, channel: "sms" });

    res.json({ success: true, message: "OTP sent for password reset" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { phone, otp, new_password } = req.body;

  if (!phone || !otp || !new_password)
    return res.json({ success: false, message: "All fields required" });

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: "+91" + phone, code: otp });

    if (verification.status !== "approved")
      return res.json({ success: false, message: "Invalid OTP" });

    const hashed = bcrypt.hashSync(new_password, 10);

    await db.query("UPDATE users SET password=? WHERE phone=?", [hashed, phone]);

    res.json({ success: true, message: "Password updated successfully. Now login." });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.json({ success: false, message: "Refresh token required" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE refresh_token=?", [refreshToken]);

    if (rows.length === 0)
      return res.json({ success: false, message: "Invalid refresh token" });

    const user = rows[0];

    const newAccessToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "15m" });

    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ success: false, message: "Access token required" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ success: false, message: "Access token required" });

    try {
      const decoded = jwt.verify(token, SECRET_KEY);

      const [rows] = await db.query(
        "SELECT id, name, email, phone, is_verified, created_at FROM users WHERE id=?",
        [decoded.id]
      );

      if (rows.length === 0)
        return res.status(404).json({ success: false, message: "User not found" });

      return res.json({ success: true, user: rows[0] });
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.json({ success: false, message: "Refresh token required" });

  try {
    await db.query("UPDATE users SET refresh_token=NULL WHERE refresh_token=?", [refreshToken]);

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
