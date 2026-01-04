const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const db = require("../config/db");
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ success: false, message: "Token required" });

    // 1️⃣ Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res
        .status(401)
        .json({ success: false, message: "Google email not verified" });
    }

    // 2️⃣ Check user exists
    const [rows] = await db.query(
      "SELECT id, name, email, profile_image FROM users WHERE email=?",
      [email]
    );

    let userId;

    if (rows.length === 0) {
      // 3️⃣ New Google User → Create account
      const [result] = await db.query(
        `INSERT INTO users 
        (name, email, password, phone, is_verified, profile_image)
        VALUES (?, ?, NULL, NULL, 1, ?)`,
        [name, email, picture]
      );

      userId = result.insertId;
    } else {
      userId = rows[0].id;

      // 🔁 Update profile image if changed
      if (rows[0].profile_image !== picture) {
        await db.query(
          "UPDATE users SET profile_image=? WHERE id=?",
          [picture, userId]
        );
      }
    }

    // 4️⃣ Generate Tokens
    const accessToken = jwt.sign(
      { id: userId, email },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: userId, email },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    // 5️⃣ Save refresh token
    await db.query(
      "UPDATE users SET refresh_token=? WHERE id=?",
      [refreshToken, userId]
    );

    // 6️⃣ Final response
    res.json({
      success: true,
      message: "Google login successful",
      user: {
        id: userId,
        name,
        email,
        profile_image: picture,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};
