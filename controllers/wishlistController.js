
const db = require("../config/db");

// exports.getWishlist = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [rows] = await db.query(
//       `SELECT w.id, w.product_id, p.name, p.new_proce, p.image AS product_image
//        FROM wishlist w
//        JOIN products p ON w.product_id = p.id
//        WHERE w.user_id = ?`,
//       [userId]
//     );

//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// POST /wishlist
// exports.addToWishlist = async (req, res) => {
//   try {
//     const { user_id, product_id } = req.body; // make sure body has correct fields
//     const sql = "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)";
//     await db.query(sql, [user_id, product_id]);
//     res.status(200).json({ success: true, message: "Added to wishlist" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Wishlist insert error" });
//   }
// };

exports.addToWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;  // <-- JWT se aayega, body se nahi
    const { product_id } = req.body;

    const sql = "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)";

    await db.query(sql, [user_id, product_id]);

    res.status(200).json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Wishlist insert error" });
  }
};


exports.getWishlist = async (req, res) => {
  try {
    const userId = req.params.userId;  // <-- FIXED

    const sql = `
      SELECT 
        w.id AS wishlist_id,
        w.user_id,
        w.product_id,
        p.name,
        p.image,
        p.new_price,
        p.old_price,
        p.rating,
        (SELECT COUNT(*) 
         FROM product_reviews pr 
         WHERE pr.product_id = p.id) AS reviews_count
      FROM wishlist w
      JOIN products p ON p.id = w.product_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC;
    `;

    const [result] = await db.query(sql, [userId]);

    res.status(200).json({
      success: true,
      wishlist: result
    });
  } catch (err) {
    console.error("Wishlist API Error:", err);
    res.status(500).json({ message: "Wishlist fetch error" });
  }
};


// Remove from wishlist
// DELETE /wishlist/:wishlistId
exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlistId = req.params.wishlistId;
    const sql = "DELETE FROM wishlist WHERE id = ?";
    await db.query(sql, [wishlistId]);
    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Wishlist delete error" });
  }
};
