const db = require("../config/db");

exports.getAddresses = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM addresses WHERE user_id = ?",
    [req.user.id]
  );

  res.json({ success: true, addresses: rows });
};
