const db = require("../config/db");

/**
 * 1️⃣ ADD REVIEW
 */
exports.addReview = async (req, res) => {
  const userId = req.user.id;
  const { product_id, rating, review_text } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid rating" });
  }

  try {
    // already reviewed?
    const [exist] = await db.query(
      "SELECT id FROM product_reviews WHERE product_id=? AND user_id=?",
      [product_id, userId]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Already reviewed" });
    }

    // insert review
    await db.query(
      `INSERT INTO product_reviews 
       (product_id, user_id, rating, review_text)
       VALUES (?, ?, ?, ?)`,
      [product_id, userId, rating, review_text || null]
    );

    // update rating table
    await updateProductRating(product_id);

    res.json({ success: true, message: "Review added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2️⃣ GET REVIEWS BY PRODUCT
 */
exports.getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const [reviews] = await db.query(
      `SELECT r.id, r.rating, r.review_text, r.created_at, r.user_id,  
              u.name AS user_name, u.profile_image
       FROM product_reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3️⃣ UPDATE REVIEW
 */
exports.updateReview = async (req, res) => {
  const userId = req.user.id;
  const { reviewId } = req.params;
  const { rating, review_text } = req.body;

  try {
    const [review] = await db.query(
      "SELECT product_id FROM product_reviews WHERE id=? AND user_id=?",
      [reviewId, userId]
    );

    if (review.length === 0) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await db.query(
      `UPDATE product_reviews
       SET rating=?, review_text=?
       WHERE id=?`,
      [rating, review_text, reviewId]
    );

    await updateProductRating(review[0].product_id);

    res.json({ success: true, message: "Review updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4️⃣ DELETE REVIEW
 */
exports.deleteReview = async (req, res) => {
  const userId = req.user.id;
  const { reviewId } = req.params;

  try {
    const [review] = await db.query(
      "SELECT product_id FROM product_reviews WHERE id=? AND user_id=?",
      [reviewId, userId]
    );

    if (review.length === 0) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await db.query("DELETE FROM product_reviews WHERE id=?", [reviewId]);
    await updateProductRating(review[0].product_id);

    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5️⃣ CHECK USER REVIEWED
 */
exports.hasUserReviewed = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const [rows] = await db.query(
    "SELECT id FROM product_reviews WHERE product_id=? AND user_id=?",
    [productId, userId]
  );

  res.json({ reviewed: rows.length > 0 });
};

/**
 * 6️⃣ RATING SUMMARY
 */
exports.getRatingSummary = async (req, res) => {
  const { productId } = req.params;

  const [rating] = await db.query(
    "SELECT rating_value, rating_count FROM product_ratings WHERE product_id=?",
    [productId]
  );

  res.json(rating[0] || { rating_value: 0, rating_count: 0 });
};

/**
 * 🔁 Helper: update product rating
 */
async function updateProductRating(productId) {
  await db.query(
    `INSERT INTO product_ratings (product_id, rating_value, rating_count)
     VALUES (?, 
       (SELECT IFNULL(AVG(rating),0) FROM product_reviews WHERE product_id=?),
       (SELECT COUNT(*) FROM product_reviews WHERE product_id=?))
     ON DUPLICATE KEY UPDATE
       rating_value = VALUES(rating_value),
       rating_count = VALUES(rating_count)`,
    [productId, productId, productId]
  );
  // also update products table (for listing)
  await db.query(
    `UPDATE products p
     JOIN product_ratings r ON r.product_id = p.id
     SET p.rating = r.rating_value,
         p.ratings_count = r.rating_count
     WHERE p.id=?`,
    [productId]
  );
}

exports.getReviewSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        COUNT(*) as total_ratings,
        ROUND(AVG(rating),1) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM product_reviews
      WHERE product_id = ?
      `,
      [productId]
    );

    const r = rows[0];

    res.json({
      average_rating: r.average_rating || 0,
      total_ratings: r.total_ratings || 0,
      star_counts: {
        5: r.five_star,
        4: r.four_star,
        3: r.three_star,
        2: r.two_star,
        1: r.one_star,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
