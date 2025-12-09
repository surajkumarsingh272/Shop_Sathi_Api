// require("dotenv").config();
// const express = require("express");
// const mysql = require("mysql2/promise");
// const twilio = require("twilio");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const rateLimit = require("express-rate-limit");
// const db = require("./db"); // MUST be pool.promise()
// const upload = require("./upload_images");

// const app = express();
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));


// // ====================== FIRST API (PRODUCT + CATEGORY + SEARCH API) =======================

// // Home products
// app.get("/home-products", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM products ORDER BY rating DESC LIMIT 20";
//         const [result] = await db.query(sql);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(400).json({ message: "Home products fetch error" });
//     }
// });

// // Categories
// app.get("/categories", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM categories";
//         const [result] = await db.query(sql);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(400).json({ message: "categories fetch error" });
//     }
// });

// // Product screen
// app.get("/product-screen", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM products ORDER BY rating DESC LIMIT 50";
//         const [result] = await db.query(sql);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(400).json({ message: "ProductScreen fetch error" });
//     }
// });

// // Upload
// app.post("/upload", upload.single("image"), (req, res) => {
//     res.json({ success: true, filename: req.file.filename });
// });

// // Add product
// app.post("/add-product", async (req, res) => {
//     const { name, image, old_price, new_price, rating, discount, category_id } = req.body;

//     try {
//         const sql =
//             "INSERT INTO products (name, image, old_price, new_price, rating, discount, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
//         await db.query(sql, [name, image, old_price, new_price, rating, discount, category_id]);

//         res.status(200).json({ message: "Product added successfully" });
//     } catch (err) {
//         res.status(400).json({ message: "Product insert error", err });
//     }
// });



// // Product by id
// app.get("/product/:id", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM products WHERE id = ?";
//         const [result] = await db.query(sql, [req.params.id]);
//         res.status(200).json(result[0]);
//     } catch (err) {
//         res.status(400).json({ message: "Product fetch error" });
//     }
// });

// // Product colors
// app.get("/product/:id/colors", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM product_colors WHERE product_id = ?";
//         const [result] = await db.query(sql, [req.params.id]);
//         res.status(200).json(result);
//     } catch (err) {
//         res.status(400).json({ message: "Product colors fetch error" });
//     }
// });

// // Product sizes
// app.get("/product/:id/sizes", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM product_sizes WHERE product_id = ?";
//         const [result] = await db.query(sql, [req.params.id]);
//         res.status(200).json(result);
//     } catch (err) {
//         res.status(400).json({ message: "Product sizes fetch error" });
//     }
// });

// // Product images
// app.get("/product/:id/images", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM product_images WHERE product_id = ?";
//         const [result] = await db.query(sql, [req.params.id]);
//         res.status(200).json(result);
//     } catch (err) {
//         res.status(400).json({ message: "Product images fetch error" });
//     }
// });

// // Product offers
// app.get("/product/:id/offers", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM product_offers WHERE product_id = ?";
//         const [result] = await db.query(sql, [req.params.id]);
//         res.status(200).json(result);
//     } catch (err) {
//         res.status(400).json({ message: "Product offers fetch error" });
//     }
// });

// // Product highlights
// app.get("/product/:id/highlights", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM product_highlights WHERE product_id = ?";
//         const [result] = await db.query(sql, [req.params.id]);
//         res.status(200).json(result);
//     } catch (err) {
//         res.status(400).json({ message: "Product highlights fetch error" });
//     }
// });

// // Reviews
// app.get("/reviews/:product_id", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM product_reviews WHERE product_id = ?";
//         const [result] = await db.query(sql, [req.params.product_id]);
//         res.status(200).json(result);
//     } catch (err) {
//         res.status(400).json({ message: "Reviews fetch error" });
//     }
// });

// // Rating
// app.get("/rating/:product_id", async (req, res) => {
//     try {
//         const sql = "SELECT * FROM product_ratings WHERE product_id = ?";
//         const [result] = await db.query(sql, [req.params.product_id]);
//         res.status(200).json(result);
//     } catch (err) {
//         res.status(400).json({ message: "Rating fetch error" });
//     }
// });

// // Product category
// app.get("/product/:id/category", async (req, res) => {
//     try {
//         const sql = `SELECT c.* FROM categories c JOIN products p ON p.category_id = c.id WHERE p.id = ?`;
//         const [result] = await db.query(sql, [req.params.id]);
//         res.status(200).json(result[0] || {});
//     } catch (err) {
//         res.status(400).json({ message: "Category fetch error" });
//     }
// });

// // SEARCH 2.0
// app.get("/search", async (req, res) => {
//     const query = req.query.q;
//     if (!query) return res.status(400).json({ message: "Query is required" });

//     try {
//         const cleanQuery = query.toLowerCase();

//         const sql = `
//             SELECT id, name, new_price, old_price, image, rating, discount
//             FROM products
//             WHERE LOWER(name) LIKE ?
//             LIMIT 10
//         `;

//         const [result] = await db.query(sql, [`%${cleanQuery}%`]);

//         res.status(200).json({
//             success: true,
//             total: result.length,
//             products: result,
//         });
//     } catch (err) {
//         res.status(500).json({ message: "Search fetch error" });
//     }
// });

// // Recent search add
// app.post("/recent-search", async (req, res) => {
//     const { user_id, keyword } = req.body;

//     if (!user_id || !keyword)
//         return res.status(400).json({ message: "Missing fields" });

//     try {
//         const sql = `
//             INSERT INTO recent_searches (user_id, keyword)
//             VALUES (?, ?)
//             ON DUPLICATE KEY UPDATE created_at = NOW()
//         `;
//         await db.query(sql, [user_id, keyword]);

//         res.json({ success: true });
//     } catch (err) {
//         res.status(500).json({ message: "Error saving search" });
//     }
// });

// // Recent searches
// app.get("/recent-searches/:user_id", async (req, res) => {
//     try {
//         const sql = `
//             SELECT keyword 
//             FROM recent_searches 
//             WHERE user_id = ?
//             ORDER BY created_at DESC
//             LIMIT 10
//         `;

//         const [result] = await db.query(sql, [req.params.user_id]);
//         res.json({ success: true, searches: result });
//     } catch (err) {
//         res.status(500).json({ message: "Error fetching recent" });
//     }
// });

// // Popular searches
// app.get("/popular-searches", async (req, res) => {
//     try {
//         const sql = `
//             SELECT keyword, COUNT(*) AS count 
//             FROM recent_searches 
//             GROUP BY keyword 
//             ORDER BY count DESC 
//             LIMIT 10
//         `;

//         const [result] = await db.query(sql);
//         res.json({ success: true, popular: result });
//     } catch (err) {
//         res.status(500).json({ message: "Error" });
//     }
// });


// // ====================== SECOND API (AUTH + PROFILE + OTP) =======================


// const SECRET_KEY = process.env.SECRET_KEY;


// const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
// );

// // Rate limit for OTP
// const otpLimiter = rateLimit({
//     windowMs: 60 * 1000,
//     max: 10,
//     message: { success: false, message: "Too many OTP requests" },
// });

// // Register
// app.post("/register", otpLimiter, async (req, res) => {
//     const { name, email, phone, password } = req.body;

//     if (!name || !email || !phone || !password) {
//         return res.json({ success: false, message: "All fields required" });
//     }

//     try {
//         const [rows] = await db.query(
//             "SELECT * FROM users WHERE email=? OR phone=?",
//             [email, phone]
//         );

//         if (rows.length > 0) {
//             return res.json({ success: false, message: "User already exists" });
//         }

//         const hashedPassword = bcrypt.hashSync(password, 10);

//         await db.query(
//             "INSERT INTO users(name,email,phone,password,is_verified) VALUES(?,?,?,?,0)",
//             [name, email, phone, hashedPassword]
//         );

//         await client.verify.v2
//             .services(process.env.TWILIO_VERIFY_SID)
//             .verifications.create({ to: "+91" + phone, channel: "sms" });

//         res.json({
//             success: true,
//             message: "OTP sent to your phone. Please verify.",
//         });
//     } catch (error) {
//         res.json({ success: false, error: error.message });
//     }
// });

// // Verify OTP
// app.post("/verify-otp", async (req, res) => {
//     const { phone, otp } = req.body;

//     if (!phone || !otp)
//         return res.json({ success: false, message: "Phone & OTP required" });

//     try {
//         const verification = await client.verify.v2
//             .services(process.env.TWILIO_VERIFY_SID)
//             .verificationChecks.create({ to: "+91" + phone, code: otp });

//         if (verification.status !== "approved")
//             return res.json({ success: false, message: "Invalid OTP" });

//         await db.query("UPDATE users SET is_verified=1 WHERE phone=?", [phone]);

//         const [rows] = await db.query("SELECT * FROM users WHERE phone=?", [
//             phone,
//         ]);

//         if (rows.length === 0)
//             return res.json({ success: false, message: "User not found" });

//         const user = rows[0];

//         const accessToken = jwt.sign(
//             { id: user.id, email: user.email },
//             SECRET_KEY,
//             { expiresIn: "15m" }
//         );
//         const refreshToken = jwt.sign(
//             { id: user.id, email: user.email },
//             SECRET_KEY,
//             { expiresIn: "7d" }
//         );

//         await db.query("UPDATE users SET refresh_token=? WHERE id=?", [
//             refreshToken,
//             user.id,
//         ]);

//         res.json({
//             success: true,
//             message: "Phone verified. Account activated!",
//             accessToken,
//             refreshToken,
//         });
//     } catch (error) {
//         res.json({ success: false, error: error.message });
//     }
// });

// // Login
// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password)
//         return res.json({
//             success: false,
//             message: "Email & Password required",
//         });

//     try {
//         const [rows] = await db.query("SELECT * FROM users WHERE email=?", [
//             email,
//         ]);

//         if (rows.length === 0)
//             return res.json({ success: false, message: "User not found" });

//         const user = rows[0];

//         if (user.is_verified === 0)
//             return res.json({
//                 success: false,
//                 message: "Please verify OTP first",
//             });

//         const valid = bcrypt.compareSync(password, user.password);
//         if (!valid)
//             return res.json({ success: false, message: "Invalid password" });

//         const accessToken = jwt.sign(
//             { id: user.id, email: user.email },
//             SECRET_KEY,
//             { expiresIn: "15m" }
//         );

//         const refreshToken = jwt.sign(
//             { id: user.id, email: user.email },
//             SECRET_KEY,
//             { expiresIn: "7d" }
//         );

//         await db.query("UPDATE users SET refresh_token=? WHERE id=?", [
//             refreshToken,
//             user.id,
//         ]);

//         res.json({
//             success: true,
//             message: "Login successful",
//             accessToken,
//             refreshToken,
//         });
//     } catch (error) {
//         res.json({ success: false, error: error.message });
//     }
// });

// // Forgot Password
// app.post("/forgot-password", otpLimiter, async (req, res) => {
//     const { phone } = req.body;

//     if (!phone)
//         return res.json({ success: false, message: "Phone required" });

//     try {
//         const [rows] = await db.query("SELECT * FROM users WHERE phone=?", [
//             phone,
//         ]);

//         if (rows.length === 0)
//             return res.json({ success: false, message: "User not found" });

//         await client.verify.v2
//             .services(process.env.TWILIO_VERIFY_SID)
//             .verifications.create({ to: "+91" + phone, channel: "sms" });

//         res.json({ success: true, message: "OTP sent for password reset" });
//     } catch (error) {
//         res.json({ success: false, error: error.message });
//     }
// });

// // Reset Password
// app.post("/reset-password", async (req, res) => {
//     const { phone, otp, new_password } = req.body;

//     if (!phone || !otp || !new_password)
//         return res.json({
//             success: false,
//             message: "All fields required",
//         });

//     try {
//         const verification = await client.verify.v2
//             .services(process.env.TWILIO_VERIFY_SID)
//             .verificationChecks.create({ to: "+91" + phone, code: otp });

//         if (verification.status !== "approved")
//             return res.json({ success: false, message: "Invalid OTP" });

//         const hashed = bcrypt.hashSync(new_password, 10);

//         await db.query("UPDATE users SET password=? WHERE phone=?", [
//             hashed,
//             phone,
//         ]);

//         res.json({
//             success: true,
//             message: "Password updated successfully. Now login.",
//         });
//     } catch (error) {
//         res.json({ success: false, error: error.message });
//     }
// });

// // Refresh Token
// app.post("/refresh-token", async (req, res) => {
//     const { refreshToken } = req.body;

//     if (!refreshToken)
//         return res.json({
//             success: false,
//             message: "Refresh token required",
//         });

//     try {
//         const [rows] = await db.query(
//             "SELECT * FROM users WHERE refresh_token=?",
//             [refreshToken]
//         );

//         if (rows.length === 0)
//             return res.json({
//                 success: false,
//                 message: "Invalid refresh token",
//             });

//         const user = rows[0];

//         const newAccessToken = jwt.sign(
//             { id: user.id, email: user.email },
//             SECRET_KEY,
//             { expiresIn: "15m" }
//         );

//         res.json({ success: true, accessToken: newAccessToken });
//     } catch (error) {
//         res.json({ success: false, error: error.message });
//     }
// });

// // Profile
// app.get("/profile", async (req, res) => {
//     try {
//         const authHeader = req.headers["authorization"];
//         if (!authHeader)
//             return res
//                 .status(401)
//                 .json({ success: false, message: "Access token required" });

//         const token = authHeader.split(" ")[1];
//         if (!token)
//             return res
//                 .status(401)
//                 .json({ success: false, message: "Access token required" });

//         try {
//             const decoded = jwt.verify(token, SECRET_KEY);

//             const [rows] = await db.query(
//                 "SELECT id, name, email, phone, is_verified, created_at FROM users WHERE id=?",
//                 [decoded.id]
//             );

//             if (rows.length === 0)
//                 return res
//                     .status(404)
//                     .json({ success: false, message: "User not found" });

//             return res.json({ success: true, user: rows[0] });
//         } catch (err) {
//             return res
//                 .status(401)
//                 .json({
//                     success: false,
//                     message: "Invalid or expired token",
//                 });
//         }
//     } catch (error) {
//         res
//             .status(500)
//             .json({ success: false, error: error.message });
//     }
// });

// // Logout
// app.post("/logout", async (req, res) => {
//     const { refreshToken } = req.body;

//     if (!refreshToken)
//         return res.json({
//             success: false,
//             message: "Refresh token required",
//         });

//     try {
//         await db.query(
//             "UPDATE users SET refresh_token=NULL WHERE refresh_token=?",
//             [refreshToken]
//         );

//         res.json({ success: true, message: "Logged out successfully" });
//     } catch (error) {
//         res.json({ success: false, error: error.message });
//     }
// });

// app.get('/api/products/:id/description', async (req, res) => {
//   try {
//     const productId = req.params.id;
//     // using existing pool
//     const [rows] = await db.query(
//       'SELECT description FROM product_descriptions WHERE product_id = ?',
//       [productId]
//     );
//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ message: 'Description not found' });
//     }
//     return res.json({ description: rows[0].description });
//   } catch (err) {
//     console.error('Error fetching description:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// // ============================ START SERVER ============================

// app.listen(process.env.PORT, () => console.log("Server running on port", process.env.PORT));

