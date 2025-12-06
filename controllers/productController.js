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

exports.productStatusList = async (req, res) => {
  try {
    const sql = `
  SELECT 
    p.id,
    p.name,
    p.image AS image_url,
    p.old_price AS price,
    p.new_price AS sale_price,
    p.discount,
    p.rating
  FROM products p
  ORDER BY p.id DESC;
`;


    const [result] = await db.query(sql);

    res.status(200).json({
      success: true,
      products: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Product status fetch error" });
  }
};

exports.purchaseHistory = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const sql = `
      SELECT 
        oi.id,
        p.name AS product,
        p.image AS img,
        oi.price,
        p.rating,
        DATE_FORMAT(o.order_date, "%b %d") AS date
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC;
    `;

    const [result] = await db.query(sql, [userId]);

    res.status(200).json({
      success: true,
      history: result,
    });

  } catch (err) {
    console.error("History API Error:", err);
    res.status(500).json({ message: "Purchase history fetch error" });
  }
};

// Add to wishlist

// exports.addToWishlist = async (req, res) => {
//   try {
//     const { user_id, product_id } = req.body;
//     const sql = "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)";
//     await db.query(sql, [user_id, product_id]);
//     res.status(200).json({ success: true, message: "Added to wishlist" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Wishlist insert error" });
//   }
// };

// exports.getWishlist = async (req, res) => {
//     try {
//         const userId = req.params.user_id;

//         const sql = `
//             SELECT w.id AS wishlist_id,
//                    p.id AS product_id,
//                    p.name,
//                    p.image,
//                    p.new_price,
//                    p.old_price,
//                    p.rating,
//                    (SELECT COUNT(*) FROM product_reviews pr WHERE pr.product_id = p.id) AS reviews_count
//             FROM wishlist w
//             JOIN products p ON p.id = w.product_id
//             WHERE w.user_id = ?
//             ORDER BY w.created_at DESC
//         `;

//         const [result] = await db.query(sql, [userId]);

//         res.status(200).json({
//             success: true,
//             wishlist: result
//         });

//     } catch (err) {
//         console.error("Wishlist API Error:", err);
//         res.status(500).json({ message: "Wishlist fetch error" });
//     }
// };

// // Remove from wishlist
// exports.removeFromWishlist = async (req, res) => {
//   try {
//     const { user_id, product_id } = req.body;
//     const sql = "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?";
//     await db.query(sql, [user_id, product_id]);
//     res.status(200).json({ success: true, message: "Removed from wishlist" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Wishlist delete error" });
//   }
// };




/// suraj kumar singh////
exports.addCategory = async (req, res) => {
  try {
    const { title } = req.body;

    await db.query(
      "INSERT INTO categories (title) VALUES (?)",
      [title]
    );

    res.json({ message: "Category added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Add category error", err });
  }
};

exports.addProductColor = async (req, res) => {
  try {
    const { color_name, color_code } = req.body;
    const product_id = req.params.id;

    await db.query(
      "INSERT INTO product_colors (product_id, color_name, color_code) VALUES (?, ?, ?)",
      [product_id, color_name, color_code]
    );

    res.json({ message: "Color added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Add color error", err });
  }
};

exports.addProductDescription = async (req, res) => {
  try {
    const { language_code, description } = req.body;
    const product_id = req.params.id;

    await db.query(
      "INSERT INTO product_descriptions (product_id, language_code, description) VALUES (?, ?, ?)",
      [product_id, language_code, description]
    );

    res.json({ message: "Description added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Add description error", err });
  }
};


exports.addProductImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const image_url = req.file.filename;
    const product_id = req.params.id;

    await db.query(
      "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
      [product_id, image_url]
    );

    res.json({ message: "Image added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Add image error", err });
  }
};


exports.addProductOffer = async (req, res) => {
  try {
    const { offer_text } = req.body;
    const product_id = req.params.id;

    await db.query(
      "INSERT INTO product_offers (product_id, offer_text) VALUES (?, ?)",
      [product_id, offer_text]
    );

    res.json({ message: "Offer added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Add offer error", err });
  }
};


exports.addProductRating = async (req, res) => {
  try {
    const { rating_value, rating_count } = req.body;
    const product_id = req.params.id;

    await db.query(
      "INSERT INTO product_ratings (product_id, rating_value, rating_count) VALUES (?, ?, ?)",
      [product_id, rating_value, rating_count]
    );

    res.json({ message: "Rating added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Add rating error", err });
  }
};


exports.addProductReview = async (req, res) => {
  try {
    const { user_name, rating, review_text } = req.body;
    const product_id = req.params.id;

    await db.query(
      "INSERT INTO product_reviews (product_id, user_name, rating, review_text) VALUES (?, ?, ?, ?)",
      [product_id, user_name, rating, review_text]
    );

    res.json({ message: "Review added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Add review error", err });
  }
};


exports.addProductSize = async (req, res) => {
  try {
    const { size } = req.body;
    const product_id = req.params.id;

    await db.query(
      "INSERT INTO product_sizes (product_id, size) VALUES (?, ?)",
      [product_id, size]
    );

    res.json({ message: "Size added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Add size error", err });
  }
};


exports.addRecentSearch = async (req, res) => {
  try {
    const { user_id, keyword } = req.body;

    await db.query(
      "INSERT INTO recent_searches (user_id, keyword) VALUES (?, ?)",
      [user_id, keyword]
    );

    res.json({ message: "Search added successfully" });
  } catch (err) {
    res.status(400).json({ message: "Add recent search error", err });
  }
};


