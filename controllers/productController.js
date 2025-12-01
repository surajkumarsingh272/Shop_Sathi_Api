const db = require("../config/db");

const path = require("path");

exports.uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  res.json({ success: true, filename: req.file.filename });
};

exports.homeProducts = async (req, res) => {
  try {
    const sql = "SELECT * FROM products ORDER BY rating DESC LIMIT 20";
    const [result] = await db.query(sql);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: "Home products fetch error" });
  }
};

exports.categories = async (req, res) => {
  try {
    const sql = "SELECT * FROM categories";
    const [result] = await db.query(sql);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: "categories fetch error" });
  }
};

exports.productScreen = async (req, res) => {
  try {
    const sql = "SELECT * FROM products ORDER BY rating DESC LIMIT 50";
    const [result] = await db.query(sql);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: "ProductScreen fetch error" });
  }
};

exports.addProduct = async (req, res) => {
  
  const { name, old_price, new_price, rating, discount, category_id } = req.body;

  try {
     if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }
     const imagePath = req.file.filename; 
    const sql =
      "INSERT INTO products (name, image, old_price, new_price, rating, discount, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await db.query(sql, [name, imagePath, old_price, new_price, rating, discount, category_id]);

    res.status(200).json({ message: "Product added successfully" });
  } catch (err) {
    
    res.status(400).json({ message: "Product insert error", err });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("Deleting product ID:", req.params.id);

     await db.query("DELETE FROM `products` WHERE id=?", [productId]);

    res.status(200).json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Delete product error", err });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const sql = "SELECT * FROM products WHERE id = ?";
    const [result] = await db.query(sql, [req.params.id]);
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(400).json({ message: "Product fetch error" });
  }
};

exports.getProductColors = async (req, res) => {
  try {
    const sql = "SELECT * FROM product_colors WHERE product_id = ?";
    const [result] = await db.query(sql, [req.params.id]);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: "Product colors fetch error" });
  }
};

exports.getProductSizes = async (req, res) => {
  try {
    const sql = "SELECT * FROM product_sizes WHERE product_id = ?";
    const [result] = await db.query(sql, [req.params.id]);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: "Product sizes fetch error" });
  }
};

exports.getProductImages = async (req, res) => {
  try {
    const sql = "SELECT * FROM product_images WHERE product_id = ?";
    const [result] = await db.query(sql, [req.params.id]);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: "Product images fetch error" });
  }
};

exports.getProductOffers = async (req, res) => {
  try {
    const sql = "SELECT * FROM product_offers WHERE product_id = ?";
    const [result] = await db.query(sql, [req.params.id]);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: "Product offers fetch error" });
  }
};

exports.getProductHighlights = async (req, res) => {
  try {
    const sql = "SELECT * FROM product_highlights WHERE product_id = ?";
    const [result] = await db.query(sql, [req.params.id]);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: "Product highlights fetch error" });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const sql = "SELECT * FROM product_reviews WHERE product_id = ?";
    const [result] = await db.query(sql, [req.params.product_id]);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: "Reviews fetch error" });
  }
};

exports.getProductRating = async (req, res) => {
  try {
    const sql = "SELECT * FROM product_ratings WHERE product_id = ?";
    const [result] = await db.query(sql, [req.params.product_id]);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: "Rating fetch error" });
  }
};

exports.getProductCategory = async (req, res) => {
  try {
    const sql = `SELECT c.* FROM categories c JOIN products p ON p.category_id = c.id WHERE p.id = ?`;
    const [result] = await db.query(sql, [req.params.id]);
    res.status(200).json(result[0] || {});
  } catch (err) {
    res.status(400).json({ message: "Category fetch error" });
  }
};

exports.getProductDescription = async (req, res) => {
  try {
    const productId = req.params.id;
    const [rows] = await db.query(
      "SELECT description FROM product_descriptions WHERE product_id = ?",
      [productId]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Description not found" });
    }
    return res.json({ description: rows[0].description });
  } catch (err) {
    console.error("Error fetching description:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
