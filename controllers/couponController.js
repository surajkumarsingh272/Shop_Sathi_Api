const db = require("../config/db");

exports.getCoupons = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM coupons");

  res.json({ success: true, coupons: rows });
};
