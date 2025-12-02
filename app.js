const express = require("express");
const path = require("path");

const productRoutes = require("./routes/productRoutes");
const searchRoutes = require("./routes/searchRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const mobileRoutes = require("./routes/mobileRoutes");
const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", productRoutes);
app.use("/", searchRoutes);
app.use("/", authRoutes);
app.use("/cart", cartRoutes);
app.use("/", mobileRoutes);

app.get("/", (req, res) => res.json({ success: true, message: "API Running" }));

module.exports = app;
