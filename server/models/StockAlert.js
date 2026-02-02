const mongoose = require("mongoose");

const stockAlertSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    alertType: { type: String, enum: ["low_stock", "overstock", "expired"], required: true },
    currentQuantity: Number,
    threshold: Number,
    message: String,
    status: { type: String, enum: ["active", "acknowledged", "resolved"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("StockAlert", stockAlertSchema);
