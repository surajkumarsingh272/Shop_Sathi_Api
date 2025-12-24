const db = require("../config/db");

/**
 * ================================
 * 1️⃣ PLACE ORDER
 * ================================
 */


exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products, payment_method, total_amount } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products required"
      });
    }

    // Initial payment status
    let paymentStatus = payment_method === "cod" ? "Unpaid" : "Pending";

    // 1️⃣ Insert order
    const [orderResult] = await db.query(
      `INSERT INTO orders 
       (user_id, total_amount, order_status, payment_status, payment_method, order_date, created_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, total_amount, "Pending", paymentStatus, payment_method]
    );

    const orderId = orderResult.insertId;

    // 2️⃣ Insert order items
    for (let item of products) {
      const { product_id, quantity } = item;

      const [[product]] = await db.query(
        "SELECT new_price FROM products WHERE id = ?",
        [product_id]
      );

      if (!product) continue;

      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, product_id, quantity, product.new_price]
      );
    }

    // 3️⃣ Insert initial order tracking
    let trackingMessage =
      payment_method === "cod"
        ? "Order placed with Cash on Delivery"
        : "Payment initiated, order placed";

    await db.query(
      `INSERT INTO order_tracking (order_id, status, updated_by, message)
       VALUES (?, ?, ?, ?)`,
      [orderId, "Pending", "system", trackingMessage]
    );

    // 4️⃣ Simulate automatic order status updates
    simulateOrderProgress(orderId);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order_id: orderId
    });

  } catch (error) {
    console.error("Place Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * 🔹 Simulate order status progress for testing/demo purposes
 */
async function simulateOrderProgress(orderId) {
  const steps = [
    { status: "Processing", message: "Order is being processed", delay: 40 },
    { status: "Shipped", message: "Order has been shipped", delay: 50 },
    { status: "Delivered", message: "Order delivered to customer", delay: 100 },
  ];

  for (let step of steps) {
    await new Promise((resolve) => setTimeout(resolve, step.delay * 1000));

    // 🔥 CHECK CURRENT ORDER STATUS
    const [[order]] = await db.query(
      "SELECT order_status FROM orders WHERE id = ?",
      [orderId]
    );

    // 🔥 STOP IF ORDER CANCELLED
    if (!order || order.order_status.toLowerCase() === "cancelled") {
      console.log(`Order ${orderId} stopped due to cancellation`);
      break;
    }

    // ✅ UPDATE ORDER STATUS
    await db.query(
      `UPDATE orders SET order_status = ? WHERE id = ?`,
      [step.status, orderId]
    );

    // ✅ INSERT TRACKING
    await db.query(
      `INSERT INTO order_tracking (order_id, status, updated_by, message)
       VALUES (?, ?, ?, ?)`,
      [orderId, step.status, "system", step.message]
    );

    console.log(`Order ${orderId} updated to ${step.status}`);
  }
}

/**
 * ================================
 * 2️⃣ GET MY ORDERS (Order List)
 * ================================
 */
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT 
        id,
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

    return res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error("Get Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



/**
 * ================================
 * 3️⃣ GET MY ORDERED PRODUCTS
 * (ORDER HISTORY)
 * ================================
 */
exports.getMyOrderedProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT 
        o.id AS order_id,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.order_date,

        p.id AS product_id,
        p.name,
        p.image,
        p.rating,

        oi.quantity,
        oi.price AS single_price,
        (oi.quantity * oi.price) AS total_price,

        p.old_price,
        p.new_price,
        p.discount

      FROM orders o
      INNER JOIN order_items oi ON oi.order_id = o.id
      INNER JOIN products p ON p.id = oi.product_id
      WHERE o.user_id = ?
      ORDER BY o.id DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      products
    });

  } catch (error) {
    console.error("Get My Ordered Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



/**
 * ================================
 * 4️⃣ TRACK ORDER
 * ================================
 */
exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    console.log("Tracking Order:", orderId, "for User:", userId);

    const [[order]] = await db.query(
      `SELECT order_status, payment_status FROM orders 
       WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const [history] = await db.query(
      `SELECT status, message, created_at 
       FROM order_tracking 
       WHERE order_id = ? ORDER BY id ASC`,
      [orderId]
    );

    return res.status(200).json({
      success: true,
      current_status: order.order_status,
      payment_status: order.payment_status,
      history
    });

  } catch (err) {
    console.error("TrackOrder Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ================================
 * 5️⃣ GET SINGLE ORDER DETAIL
 * ================================
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order info
    const [orders] = await db.query(
      `SELECT 
        id,
        total_amount,
        order_status,
        payment_status,
        payment_method,
        order_date,
        created_at
      FROM orders
      WHERE id = ? AND user_id = ?`,
      [orderId, req.user.id]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const order = orders[0];

    // Get products of this order
    const [products] = await db.query(
      `SELECT 
        p.id AS product_id,
        p.name,
        p.image,
        p.rating,
        oi.quantity,
        oi.price AS single_price,
        (oi.quantity * oi.price) AS total_price,
        p.old_price,
        p.new_price,
        p.discount
      FROM order_items oi
      INNER JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?`,
      [orderId]
    );

    order.products = products;

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Get Order By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body; // reason from frontend
   

    // 1️⃣ Order check (ownership + status)
    const [[order]] = await db.query(
      `SELECT order_status, payment_method, payment_status
       FROM orders
       WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const status = order.order_status.toLowerCase();

    // 2️⃣ Cancel allowed only in pending / processing
    if (!["pending", "processing"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled when status is '${order.order_status}'`
      });
    }

    // 3️⃣ Update order status + reason + cancelled_at
    await db.query(
      `UPDATE orders 
       SET order_status = ?, cancel_reason = ?, cancelled_at = NOW() 
       WHERE id = ?`,
      ["Cancelled", reason || null, orderId]
    );

    // 4️⃣ Insert tracking
    await db.query(
      `INSERT INTO order_tracking (order_id, status, updated_by, message)
       VALUES (?, ?, ?, ?)`,
      [orderId, "Cancelled", "user", `Order cancelled by customer. Reason: ${reason || "N/A"}`]
    );

    // 5️⃣ Refund note
    let refundMessage = "No refund required";
    if (order.payment_method !== "cod" && order.payment_status.toLowerCase() === "paid") {
      refundMessage = "Refund will be processed within 5-7 working days";
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      refund_note: refundMessage
    });

  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

