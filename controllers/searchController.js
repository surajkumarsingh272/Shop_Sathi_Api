const db = require("../config/db");

exports.search = async (req, res) => {
  const { q, categoryId } = req.query;

  if (!q) {
    return res.json({ success: true, products: [] });
  }

  try {
    let sql = `
      SELECT id, name, new_price, old_price, image, rating, discount, category_id
      FROM products
      WHERE LOWER(name) LIKE ?
    `;

    const keyword = q.toLowerCase();
    const values = [`%${keyword}%`];

    // 🔥 category filter (except All)
    if (categoryId && categoryId != 1) {
      sql += ` AND category_id = ?`;
      values.push(categoryId);
    }

    // 🔥 RELEVANCE SORTING (Flipkart style)
    sql += `
      ORDER BY
        CASE
          WHEN LOWER(name) LIKE ? THEN 1      -- starts with keyword
          WHEN LOWER(name) LIKE ? THEN 2      -- exact word match
          ELSE 3
        END,
        LENGTH(name) ASC
      LIMIT 20
    `;

    values.push(
      `${keyword}%`,     // bluetooth%
      `% ${keyword}%`    // bluetooth as word
    );

    const [result] = await db.query(sql, values);

    res.json({
      success: true,
      products: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Search error" });
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
