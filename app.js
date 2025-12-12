    const express = require("express");
    const path = require("path");


    const productRoutes = require("./routes/productRoutes");
    const searchRoutes = require("./routes/searchRoutes");
    const authRoutes = require("./routes/authRoutes");
    const cartRoutes = require("./routes/cartRoutes");
    const mobileRoutes = require("./routes/mobileRoutes");

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    app.use("/", productRoutes);
    app.use("/", searchRoutes);
    app.use("/", authRoutes);
    app.use("/cart", cartRoutes);
    app.use("/", mobileRoutes);

    const profileRoutes = require("./routes/profileRoutes");
    const orderRoutes = require("./routes/orderRoutes");
    const wishlistRoutes = require("./routes/wishlistRoutes");
    const couponRoutes = require("./routes/couponRoutes");
    const supportRoutes = require("./routes/supportRoutes");


    // 🟢 NEW ROUTE → Address + Order + Razorpay Combined
    const shopRoutes = require("./routes/shopRoutes");
    const categories=require("./routes/homeRoutes");
    const addressRoutes = require("./routes/addressRoutes");

    app.use("/api/profile", profileRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/wishlist", wishlistRoutes);
    app.use("/api/coupons", couponRoutes);
    app.use("/api/support", supportRoutes);
    app.use("/api/shop", shopRoutes);
    app.use("/",categories);
    app.use("/address", addressRoutes);
    app.get("/", (req, res) => res.json({ success: true, message: "API Running" }));

    module.exports = app;
