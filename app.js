const express = require("express");
const path = require("path");

const productRoutes = require("./routes/productRoutes");
const searchRoutes = require("./routes/searchRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/", productRoutes);
app.use("/", searchRoutes);
app.use("/", authRoutes);

// Health check
app.get("/", (req, res) => res.json({ success: true, message: "API Running" }));

module.exports = app;
