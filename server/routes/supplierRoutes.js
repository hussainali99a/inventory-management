const express = require("express");
const Supplier = require("../models/Supplier");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Create supplier
router.post("/", auth, async (req, res) => {
    try {
        const { name, email, phone, address, city, state, country, paymentTerms } = req.body;
        if (!name) return res.status(400).json({ msg: "Supplier name required" });

        const supplier = new Supplier({
            name,
            email,
            phone,
            address,
            city,
            state,
            country,
            paymentTerms,
        });
        await supplier.save();
        res.status(201).json(supplier);
    } catch (err) {
        res.status(500).json({ msg: "Error creating supplier" });
    }
});

// ✅ Get all suppliers
router.get("/", auth, async (req, res) => {
    try {
        const { search } = req.query;
        let filter = { status: "active" };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const suppliers = await Supplier.find(filter).sort({ name: 1 });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching suppliers" });
    }
});

// ✅ Update supplier
router.put("/:id", auth, async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!supplier) return res.status(404).json({ msg: "Supplier not found" });
        res.json(supplier);
    } catch (err) {
        res.status(500).json({ msg: "Error updating supplier" });
    }
});

// ✅ Delete supplier
router.delete("/:id", auth, async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { status: "inactive", updatedAt: Date.now() },
            { new: true }
        );
        if (!supplier) return res.status(404).json({ msg: "Supplier not found" });
        res.json({ msg: "Supplier deleted" });
    } catch (err) {
        res.status(500).json({ msg: "Error deleting supplier" });
    }
});

module.exports = router;
