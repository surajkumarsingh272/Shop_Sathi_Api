const db = require("../config/db");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

exports.createPaymentOrder = async (req, res) => {
  try {
    const { order_id } = req.body;

    const [rows] = await db.query(
      "SELECT total_amount FROM orders WHERE id=?",
      [order_id]
    );

    if (!rows.length) {
      return res.status(400).json({ success:false, message:"Invalid order" });
    }

    const amount = rows[0].total_amount;

    const rpOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "rcpt_" + order_id,
    });

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
    res.status(500).json({ success:false, message:"Order create failed" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return res.status(400).json({ success:false, message:"Invalid signature" });
    }

    await db.query(
      `UPDATE orders 
       SET payment_status='Paid',
           order_status='Confirmed',
           razorpay_payment_id=?
       WHERE id=? AND razorpay_order_id=?`,
      [razorpay_payment_id, order_id, razorpay_order_id]
    );

    res.json({ success:true, message:"Payment verified" });
  } catch (err) {
    res.status(500).json({ success:false, message:"Verify failed" });
  }
};
