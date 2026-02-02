const express = require("express");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const StockAlert = require("../models/StockAlert");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Add product (PROTECTED)
router.post("/", auth, async (req, res) => {
  try {
    const { name, sku, category, supplier, quantity, reorderLevel, price, costPrice } = req.body;

    // Validation
    if (!name || !sku || !quantity || !price) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const productExists = await Product.findOne({ sku });
    if (productExists) return res.status(400).json({ msg: "SKU already exists" });

    const product = new Product({
      name,
      sku,
      category,
      supplier,
      quantity,
      reorderLevel,
      price,
      costPrice,
      createdBy: req.user.id,
    });

    await product.save();

    // Create stock movement record
    const movement = new StockMovement({
      product: product._id,
      type: "in",
      quantity,
      reason: "Initial stock",
      createdBy: req.user.id,
      newQuantity: quantity,
    });
    await movement.save();

    res.status(201).json({ msg: "Product created", product });
  } catch (err) {
    res.status(500).json({ msg: "Error adding product", error: err.message });
  }
});

// ✅ Get all products with filters
router.get("/", auth, async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .populate("category supplier createdBy")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching products", error: err.message });
  }
});

// ✅ Get single product
router.get("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category supplier createdBy");
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching product" });
  }
});

// ✅ Update product
router.put("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json({ msg: "Product updated", product });
  } catch (err) {
    res.status(500).json({ msg: "Error updating product" });
  }
});

// ✅ Delete product
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting product" });
  }
});

// ✅ Update stock (in/out)
router.post("/:id/stock", auth, async (req, res) => {
  try {
    const { type, quantity, reason, reference } = req.body;

    if (!["in", "out", "adjustment", "return"].includes(type)) {
      return res.status(400).json({ msg: "Invalid stock type" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    const previousQuantity = product.quantity;
    const newQuantity = type === "out" || type === "return"
      ? previousQuantity - quantity
      : previousQuantity + quantity;

    if (newQuantity < 0) {
      return res.status(400).json({ msg: "Insufficient stock" });
    }

    product.quantity = newQuantity;
    product.updatedAt = Date.now();
    await product.save();

    // Create stock movement record
    const movement = new StockMovement({
      product: product._id,
      type,
      quantity,
      reason,
      reference,
      previousQuantity,
      newQuantity,
      createdBy: req.user.id,
    });
    await movement.save();

    // Check if stock needs alert
    if (newQuantity <= product.reorderLevel && newQuantity > 0) {
      const existingAlert = await StockAlert.findOne({
        product: product._id,
        alertType: "low_stock",
        status: "active",
      });
      if (!existingAlert) {
        await new StockAlert({
          product: product._id,
          alertType: "low_stock",
          currentQuantity: newQuantity,
          threshold: product.reorderLevel,
          message: `Low stock alert: ${product.name}`,
        }).save();
      }
    }

    res.json({ msg: "Stock updated", product, movement });
  } catch (err) {
    res.status(500).json({ msg: "Error updating stock", error: err.message });
  }
});

// ✅ Get stock movements for product
router.get("/:id/movements", auth, async (req, res) => {
  try {
    const movements = await StockMovement.find({ product: req.params.id })
      .populate("createdBy")
      .sort({ createdAt: -1 });
    res.json(movements);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching movements" });
  }
});

module.exports = router;
