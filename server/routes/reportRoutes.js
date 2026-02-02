const express = require("express");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Dashboard statistics (shape aligned with frontend)
router.get("/dashboard", auth, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ status: "active" });
        const lowStockCount = await Product.countDocuments({
            status: "active",
            $expr: { $lte: ["$quantity", "$reorderLevel"] },
        });

        const totalValue = await Product.aggregate([
            { $match: { status: "active" } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$price"] } } } },
        ]);
        const inventoryValue = totalValue[0]?.total || 0;

        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: { $in: ["pending", "confirmed"] } });

        const topProducts = await Product.find({ status: "active" })
            .select("name sku quantity reorderLevel")
            .sort({ quantity: -1 })
            .limit(5)
            .lean();

        const recentMovements = await StockMovement.find()
            .populate("product createdBy")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.json({
            totalProducts,
            lowStockCount,
            inventoryValue,
            totalOrders,
            pendingOrders,
            topProducts,
            recentMovements,
        });
    } catch (err) {
        res.status(500).json({ msg: "Error fetching dashboard data" });
    }
});

// ✅ Inventory report
router.get("/inventory", auth, async (req, res) => {
    try {
        const products = await Product.find({ status: "active" })
            .populate("category supplier")
            .sort({ name: 1 });

        const report = {
            total_products: products.length,
            total_value: 0,
            low_stock_items: [],
            overstock_items: [],
            by_category: {},
        };

        products.forEach(product => {
            report.total_value += product.quantity * product.price;

            if (product.quantity <= product.reorderLevel) {
                report.low_stock_items.push({
                    sku: product.sku,
                    name: product.name,
                    quantity: product.quantity,
                    reorderLevel: product.reorderLevel,
                });
            }

            const cat = product.category?.name || "Uncategorized";
            if (!report.by_category[cat]) {
                report.by_category[cat] = 0;
            }
            report.by_category[cat] += product.quantity;
        });

        res.json(report);
    } catch (err) {
        res.status(500).json({ msg: "Error generating inventory report" });
    }
});

// ✅ Sales/Movement report
router.get("/movements", auth, async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        let filter = {};

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        if (type) filter.type = type;

        const movements = await StockMovement.find(filter)
            .populate("product createdBy")
            .sort({ createdAt: -1 });

        const summary = {
            total_in: 0,
            total_out: 0,
            movements: movements,
        };

        movements.forEach(m => {
            if (m.type === "in") summary.total_in += m.quantity;
            if (m.type === "out") summary.total_out += m.quantity;
        });

        res.json(summary);
    } catch (err) {
        res.status(500).json({ msg: "Error generating movement report" });
    }
});

// ✅ Top selling products
router.get("/top-products", auth, async (req, res) => {
    try {
        const topProducts = await StockMovement.aggregate([
            { $match: { type: "out" } },
            { $group: { _id: "$product", total_sold: { $sum: "$quantity" } } },
            { $sort: { total_sold: -1 } },
            { $limit: 10 },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
        ]);

        res.json(topProducts);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching top products" });
    }
});

module.exports = router;
