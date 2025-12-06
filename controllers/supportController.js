const db = require("../config/db");

exports.sendSupportMessage = async (req, res) => {
  const { message } = req.body;

  await db.query(
    "INSERT INTO support (user_id, message) VALUES (?, ?)",
    [req.user.id, message]
  );

  res.json({ success: true, message: "Support message sent" });
};
