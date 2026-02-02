const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true, required: true },
    orderType: { type: String, enum: ["purchase", "sales"], required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    customer: String,
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            quantity: Number,
            unitPrice: Number,
            total: Number,
        }
    ],
    totalAmount: Number,
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
    expectedDelivery: Date,
    actualDelivery: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    notes: String,
});

module.exports = mongoose.model("Order", orderSchema);
