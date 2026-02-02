const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["in", "out", "adjustment", "return"], required: true },
    quantity: { type: Number, required: true },
    reason: String,
    reference: String, // PO#, SO#, etc
    previousQuantity: Number,
    newQuantity: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    notes: String,
});

module.exports = mongoose.model("StockMovement", stockMovementSchema);
