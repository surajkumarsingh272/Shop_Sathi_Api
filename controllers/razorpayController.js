const db = require("../config/db");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();
const { simulateOrderProgress } = require("./orderController");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

exports.createPaymentOrder = async (req, res) => {
  try {
    const { order_id } = req.body;

    
    if (!order_id) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const [rows] = await db.query(
      "SELECT total_amount FROM orders WHERE id=?",
      [order_id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Order not found in database" });
    }

  
    const amountInPaise = Math.round(rows[0].total_amount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${order_id}_${Date.now()}`,
    };

    const rpOrder = await razorpay.orders.create(options);

    await db.query(
      "UPDATE orders SET razorpay_order_id=? WHERE id=?",
      [rpOrder.id, order_id]
    );

    res.json({
      success: true,
      razorpay_order_id: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      key: process.env.RAZORPAY_KEY,
    });

  } catch (err) {
    console.error("Razorpay Order Creation Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Could not initiate payment. Please try again." 
    });
  }
};


exports.verifyPayment = async (req, res) => {
  const connection = await db.getConnection(); 
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
    const paymentResponseString = JSON.stringify(req.body);
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    await connection.beginTransaction();

    const [orderRows] = await connection.query(
      "SELECT user_id, total_amount FROM orders WHERE id=? AND razorpay_order_id=? FOR UPDATE", 
      [order_id, razorpay_order_id]
    );

    if (!orderRows.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Order not found" });
    }

    const { user_id, total_amount } = orderRows[0];

  
    await connection.query(
      `UPDATE orders SET payment_status='Paid', order_status='Pending' WHERE id=?`,
      [order_id]
    );

  
    await connection.query(
      `INSERT INTO order_tracking (order_id, status, updated_by, message) 
       VALUES (?, ?, ?, ?)`,
      [order_id, 'processing', 'system', 'Payment Successful. Order is being processed.']
    );

    await connection.query(
      `INSERT INTO payments (
        order_id, user_id, payment_gateway, razorpay_order_id, 
        razorpay_payment_id, razorpay_signature, amount, currency, 
        payment_status, payment_response, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        order_id, user_id, "Razorpay", razorpay_order_id, 
        razorpay_payment_id, razorpay_signature, total_amount, "INR", 
        "success", paymentResponseString
      ]
    );

    await connection.commit();

    simulateOrderProgress(order_id);

    res.json({ 
      success: true, 
      message: "Payment verified & Order is now processing" 
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: "Server error during verification" });
  } finally {
    if (connection) connection.release();
  }
};

