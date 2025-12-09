const db = require("../config/db");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_SECRET
// });


exports.addAddress = async (req, res) => {
  try {
    const { user_id, name, phone, address, city, state, pincode, is_default } = req.body;

    if (is_default == 1) {
      await db.query("UPDATE delivery_address SET is_default = 0 WHERE user_id = ?", [user_id]);
    }

    await db.query(
      `INSERT INTO delivery_address 
        (user_id, name, phone, address, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, name, phone, address, city, state, pincode, is_default]
    );

    res.json({ success: true, message: "Address added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Add address error" });
  }
};


exports.getDefaultAddress = async (req, res) => {
  try {
    const userId = req.params.user_id;

    const [rows] = await db.query(
      "SELECT * FROM delivery_address WHERE user_id = ? AND is_default = 1",
      [userId]
    );

    res.json({ success: true, address: rows[0] || null });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Fetch address error" });
  }
};


exports.createOrder = async (req, res) => {
  try {
    const { user_id, total_amount, payment_method } = req.body;

    const [result] = await db.query(
      `INSERT INTO orders 
       (user_id, total_amount, order_status, payment_status, payment_method, order_date)
       VALUES (?, ?, 'Pending', 'Pending', ?, NOW())`,
      [user_id, total_amount, payment_method]
    );

    res.json({
      success: true,
      orderId: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Order create error" });
  }
};


// exports.createPaymentOrder = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     const rpOrder = await razorpay.orders.create({
//       amount: amount * 100,
//       currency: "INR",
//       receipt: "rcpt_" + Date.now()
//     });

//     res.json({
//       success: true,
//       razorpay_order_id: rpOrder.id,
//       amount: rpOrder.amount,
//       currency: rpOrder.currency
//     });

//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

//     const sign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (sign !== razorpay_signature) {
//       return res.json({ success: false, message: "Payment verification failed!" });
//     }

//     await db.query(
//       "UPDATE orders SET payment_status='Paid', order_status='Confirmed' WHERE id = ?",
//       [order_id]
//     );

//     res.json({ success: true, message: "Payment verified successfully" });

//   } catch (err) {
//     console.error(err);
//     res.json({ success: false, message: "Payment verify error" });
//   }
// };
