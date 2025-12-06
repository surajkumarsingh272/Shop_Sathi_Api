const db = require("../config/db");

exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT 
        id, 
        user_id,
        total_amount,
        order_status,
        payment_status,
        payment_method,
        order_date,
        created_at
      FROM orders 
      WHERE user_id = ?
      ORDER BY id DESC`,
      [req.user.id]
    );

    res.json({ success: true, orders });

  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [tracking] = await db.query(
      `SELECT 
        id,
        order_id,
        status,
        message,
        updated_at
      FROM order_tracking 
      WHERE order_id = ?
      ORDER BY id ASC`,
      [orderId]
    );

    res.json({ success: true, tracking });

  } catch (error) {
    console.error("Track Order Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
