const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Create order
router.post("/", auth, async (req, res) => {
    try {
        const { orderType, supplier, items, notes } = req.body;

        if (!orderType || !items || items.length === 0) {
            return res.status(400).json({ msg: "Invalid order data" });
        }

        // Generate unique order number
        const orderCount = await Order.countDocuments();
        const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

        let totalAmount = 0;
        items.forEach(item => {
            totalAmount += (item.quantity * item.unitPrice);
        });

        const order = new Order({
            orderNumber,
            orderType,
            supplier,
            items,
            totalAmount,
            createdBy: req.user.id,
            notes,
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ msg: "Error creating order", error: err.message });
    }
});

// ✅ Get all orders
router.get("/", auth, async (req, res) => {
    try {
        const { status, orderType, page = 1, limit = 10 } = req.query;
        let filter = {};

        if (status) filter.status = status;
        if (orderType) filter.orderType = orderType;

        const skip = (page - 1) * limit;
        const orders = await Order.find(filter)
            .populate("supplier items.product createdBy")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(filter);

        res.json({
            orders,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ msg: "Error fetching orders" });
    }
});

// ✅ Update order status
router.put("/:id/status", auth, async (req, res) => {
    try {
        const { status, actualDelivery } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status,
                actualDelivery: status === "delivered" ? actualDelivery || Date.now() : null,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!order) return res.status(404).json({ msg: "Order not found" });

        // Update inventory if order is delivered
        if (status === "delivered" && order.orderType === "purchase") {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.quantity += item.quantity;
                    await product.save();

                    // Create stock movement
                    await new StockMovement({
                        product: product._id,
                        type: "in",
                        quantity: item.quantity,
                        reason: "Purchase Order",
                        reference: order.orderNumber,
                        createdBy: req.user.id,
                        newQuantity: product.quantity,
                    }).save();
                }
            }
        }

        res.json({ msg: "Order updated", order });
    } catch (err) {
        res.status(500).json({ msg: "Error updating order" });
    }
});

module.exports = router;
