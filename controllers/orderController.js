const db = require("../config/db");


// 🛠️ Helper Function: Sab kuch calculate karne ke liye
async function calculateOrderAmount(connection, products) {
  let subTotal = 0;
  let discount = 0;
  let items = [];

  for (let item of products) {
    if (!item.quantity || item.quantity < 1) throw new Error("Invalid quantity");

    // Price Verification from DB
    const [[product]] = await connection.query(
      "SELECT id, old_price, new_price FROM products WHERE id = ?",
      [item.product_id]
    );

    if (!product) throw new Error(`Product ${item.product_id} not found`);

    subTotal += product.old_price * item.quantity;
    discount += (product.old_price - product.new_price) * item.quantity;

    items.push({
      product_id: product.id,
      quantity: item.quantity,
      price: product.new_price
    });
  }

  // Logic: 500 se kam pe 50 delivery charge
  const netAmount = subTotal - discount;
  const deliveryCharge = netAmount >= 500 ? 0 : 50;
  const total = netAmount + deliveryCharge;

  return { subTotal, discount, deliveryCharge, total, items };
}

exports.getCheckoutSummary = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Products required" });
    }

    const { subTotal, discount, deliveryCharge, total } = await calculateOrderAmount(db, products);

    const d = new Date();
    d.setDate(d.getDate() + 4);

    res.json({
      success: true,
      summary: {
        subtotal: subTotal,
        discount,
        delivery_charge: deliveryCharge,
        total_payable: total,
        estimated_delivery: d.toDateString()
      }
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.placeOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.id;
    const { products, payment_method, address_id } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Products required" });
    }

    await connection.beginTransaction();

    const { total, items } = await calculateOrderAmount(connection, products);

    // ✅ FIX: Status hamesha "Pending" rakhein taaki Flutter mein Empty Box na dikhe
    // "Draft" word ko hata diya hai kyunki aapka UI usse nahi pehchanta
    const orderStatus = "Pending"; 
    const paymentStatus = payment_method === "cod" ? "Unpaid" : "Awaiting Payment";

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, order_status, payment_status, payment_method, address_id, order_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, total, orderStatus, paymentStatus, payment_method, address_id]
    );

    const orderId = orderResult.insertId;

    // Order items insert karna
    for (let item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Tracking table mein entry (Hamesha Pending status se start hoga)
    await connection.query(
      `INSERT INTO order_tracking (order_id, status, updated_by, message)
       VALUES (?, ?, ?, ?)`,
      [orderId, orderStatus, "system", payment_method === "cod" ? "Order placed with Cash on Delivery" : "Waiting for online payment verification"]
    );

    await connection.commit();

    // ✅ LOGIC: Simulation sirf COD ke liye yahan se chalegi
    if (payment_method === "cod") {
      simulateOrderProgress(orderId);
    }

    return res.status(201).json({
      success: true,
      message: payment_method === "cod" ? "Order placed successfully" : "Order initiated, awaiting payment",
      order_id: orderId,
      total_amount: total
    });

  } catch (error) {
    await connection.rollback();
    console.error("Order Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  } finally {
    connection.release();
  }
};

// ✅ Isse file mein kahin bhi call kiya ja sakta hai
async function simulateOrderProgress(orderId) {
    console.log(`Simulation started for Order ID: ${orderId}`);
    const steps = [
        { status: "processing", message: "Your order is being prepared and packed", delay: 10 },
        { status: "shipped", message: "Order has been handed over to our delivery partner", delay: 20 },
        { status: "delivered", message: "Order delivered successfully!", delay: 30 }
    ];

    for (const step of steps) {
        try {
            await new Promise(resolve => setTimeout(resolve, step.delay * 1000));
            // Baaki ka logic wahi rahega...
            await db.query("UPDATE orders SET order_status = ? WHERE id = ?", [step.status, orderId]);
            await db.query(`INSERT INTO order_tracking (order_id, status, updated_by, message) VALUES (?, ?, ?, ?)`, 
                           [orderId, step.status, "system", step.message]);
            console.log(`Order ${orderId} status: ${step.status}`);
        } catch (error) {
            console.error("Simulation Error:", error);
        }
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


exports.getOrderById = async (req, res) => {
  console.log("!!! NAYA CODE CHAL GAYA !!!");
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Is query ko dhyan se dekho, isme customer_name aur shipping_address hai
    const [orders] = await db.query(
      `SELECT 
        o.id, o.total_amount, o.order_status, o.payment_status, o.payment_method, o.order_date, o.created_at,
        u.name AS customer_name, 
        a.mobile AS customer_phone, 
        CONCAT(a.house_no, ', ', a.road_name, ', ', a.city, ', ', a.state, ' - ', a.pincode) AS shipping_address,
        p.razorpay_payment_id AS payment_id 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) return res.status(404).json({ success: false, message: "Order not found" });

    const order = orders[0];
    const [products] = await db.query(
      `SELECT p.id AS product_id, p.name, p.image, p.rating, 
              oi.quantity, oi.price AS single_price, (oi.quantity * oi.price) AS total_price,
              p.old_price, p.new_price, p.discount
       FROM order_items oi
       INNER JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`, [orderId]
    );

    order.products = products;

    // Isse confirm hoga ki naya code chal raha hai
    console.log("SUCCESS: Sending New Data Structure for Order:", orderId);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
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


module.exports = {
    getCheckoutSummary: exports.getCheckoutSummary,
    placeOrder: exports.placeOrder,
    getMyOrders: exports.getMyOrders,
    getMyOrderedProducts: exports.getMyOrderedProducts,
    trackOrder: exports.trackOrder,
    getOrderById: exports.getOrderById,
    cancelOrder: exports.cancelOrder,
    // 🔥 YE LINE MISSING HAI, ISSE ADD KARIYE
    simulateOrderProgress: simulateOrderProgress 
};