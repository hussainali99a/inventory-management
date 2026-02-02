const express = require("express");
const Category = require("../models/Category");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Create category
router.post("/", auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ msg: "Category name required" });

        const categoryExists = await Category.findOne({ name });
        if (categoryExists) return res.status(400).json({ msg: "Category already exists" });

        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ msg: "Error creating category" });
    }
});

// ✅ Get all categories
router.get("/", auth, async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching categories" });
    }
});

// ✅ Update category
router.put("/:id", auth, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!category) return res.status(404).json({ msg: "Category not found" });
        res.json(category);
    } catch (err) {
        res.status(500).json({ msg: "Error updating category" });
    }
});

// ✅ Delete category
router.delete("/:id", auth, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ msg: "Category not found" });
        res.json({ msg: "Category deleted" });
    } catch (err) {
        res.status(500).json({ msg: "Error deleting category" });
    }
});

module.exports = router;
