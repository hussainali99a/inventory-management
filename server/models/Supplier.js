const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    paymentTerms: String,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Supplier", supplierSchema);
