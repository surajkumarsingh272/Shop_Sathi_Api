
const db = require("../config/db");

const BASE_URL = "https://shopsathi.edugaondev.com";

function withImageURL(rows) {
  return rows.map(item => ({
    ...item,
    image: item.image ? `${BASE_URL}/uploads/${item.image}` : null
  }));
}

exports.getBanners = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM banners ORDER BY id DESC");
    res.json(withImageURL(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addBanner = async (req, res) => {
  try {
    const { title, redirect_url, type } = req.body;
    const image = req.file.filename;

    const [result] = await db.query(
      "INSERT INTO banners (title, image, redirect_url, type) VALUES (?, ?, ?, ?)",
      [title, image, redirect_url, type]
    );

    res.json({ success: true, id: result.insertId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY title ASC");
    res.json(withImageURL(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products ORDER BY rating DESC LIMIT 10");
    res.json(withImageURL(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNewProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products ORDER BY created_at DESC LIMIT 10");
    res.json(withImageURL(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId; 
    let query = "SELECT * FROM products";
    
    if (categoryId !== 1) {
      query += " WHERE category_id = ?";
    }

    const [rows] = categoryId === "all" 
        ? await db.query(query)
        : await db.query(query, [categoryId]);

    res.json(rows.map(item => ({
      ...item,
      image: item.image ? `${BASE_URL}/uploads/${item.image}` : null
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

