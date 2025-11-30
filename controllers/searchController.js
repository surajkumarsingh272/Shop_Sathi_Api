const db = require("../config/db");

exports.search = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ message: "Query is required" });

  try {
    const cleanQuery = query.toLowerCase();

    const sql = `
      SELECT id, name, new_price, old_price, image, rating, discount
      FROM products
      WHERE LOWER(name) LIKE ?
      LIMIT 10
    `;

    const [result] = await db.query(sql, [`%${cleanQuery}%`]);

    res.status(200).json({
      success: true,
      total: result.length,
      products: result,
    });
  } catch (err) {
    res.status(500).json({ message: "Search fetch error" });
  }
};

exports.addRecentSearch = async (req, res) => {
  const { user_id, keyword } = req.body;

  if (!user_id || !keyword)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const sql = `
      INSERT INTO recent_searches (user_id, keyword)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE created_at = NOW()
    `;
    await db.query(sql, [user_id, keyword]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error saving search" });
  }
};

exports.getRecentSearches = async (req, res) => {
  try {
    const sql = `
      SELECT keyword 
      FROM recent_searches 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const [result] = await db.query(sql, [req.params.user_id]);
    res.json({ success: true, searches: result });
  } catch (err) {
    res.status(500).json({ message: "Error fetching recent" });
  }
};

exports.getPopularSearches = async (req, res) => {
  try {
    const sql = `
      SELECT keyword, COUNT(*) AS count 
      FROM recent_searches 
      GROUP BY keyword 
      ORDER BY count DESC 
      LIMIT 10
    `;

    const [result] = await db.query(sql);
    res.json({ success: true, popular: result });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};
