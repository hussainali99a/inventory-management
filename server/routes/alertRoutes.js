const express = require("express");
const StockAlert = require("../models/StockAlert");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Get all stock alerts
router.get("/", auth, async (req, res) => {
    try {
        const { status = "active" } = req.query;

        const alerts = await StockAlert.find({ status })
            .populate("product")
            .sort({ createdAt: -1 });

        const alertsByType = {
            low_stock: alerts.filter(a => a.alertType === "low_stock").length,
            overstock: alerts.filter(a => a.alertType === "overstock").length,
            total: alerts.length,
        };

        res.json({ alerts, alertsByType });
    } catch (err) {
        res.status(500).json({ msg: "Error fetching alerts" });
    }
});

// ✅ Acknowledge alert
router.put("/:id/acknowledge", auth, async (req, res) => {
    try {
        const alert = await StockAlert.findByIdAndUpdate(
            req.params.id,
            { status: "acknowledged" },
            { new: true }
        );
        if (!alert) return res.status(404).json({ msg: "Alert not found" });
        res.json({ msg: "Alert acknowledged", alert });
    } catch (err) {
        res.status(500).json({ msg: "Error acknowledging alert" });
    }
});

// ✅ Resolve alert
router.put("/:id/resolve", auth, async (req, res) => {
    try {
        const alert = await StockAlert.findByIdAndUpdate(
            req.params.id,
            {
                status: "resolved",
                resolvedAt: Date.now(),
                resolvedBy: req.user.id,
            },
            { new: true }
        );
        if (!alert) return res.status(404).json({ msg: "Alert not found" });
        res.json({ msg: "Alert resolved", alert });
    } catch (err) {
        res.status(500).json({ msg: "Error resolving alert" });
    }
});

module.exports = router;
