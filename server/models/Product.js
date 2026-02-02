const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  // Core identification
  sku: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: String,

  // Electronics-specific fields
  brand: String,
  model: String,
  variant: String, // e.g. 128GB / 8GB RAM
  serialNumber: String,
  imeiNumber: String,
  warrantyMonths: Number,
  warrantyExpiry: Date,
  purchaseDate: Date,
  specs: String, // free-form specs (processor, RAM, screen size, etc.)
  location: String, // showroom floor / rack / warehouse location

  // Relationships
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },

  // Inventory & pricing
  quantity: { type: Number, required: true, default: 0 },
  reorderLevel: { type: Number, default: 10 },
  reorderQuantity: { type: Number, default: 50 },
  price: { type: Number, required: true },
  costPrice: Number,
  sellingPrice: Number,

  // Status & audit
  status: {
    type: String,
    enum: ["active", "inactive", "discontinued"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Product", productSchema);
