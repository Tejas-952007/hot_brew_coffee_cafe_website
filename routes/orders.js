// ===================================
// ORDER ROUTES - Cart & Checkout
// ===================================

const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// POST /api/orders - Place a new order
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { customer_name, customer_email, customer_phone, delivery_address, items, notes } = req.body;

        if (!customer_name || !customer_email || !customer_phone || !delivery_address) {
            return res.status(400).json({ error: 'All customer details are required' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        // Calculate total
        const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        await connection.beginTransaction();

        // Insert order
        const [orderResult] = await connection.execute(
            `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, delivery_address, total_amount, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.session?.userId || null, customer_name, customer_email, customer_phone, delivery_address, total_amount, notes || null]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of items) {
            await connection.execute(
                `INSERT INTO order_items (order_id, item_name, item_price, quantity, special_instructions)
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.name, item.price, item.quantity, item.instructions || null]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: 'Order placed successfully!',
            order: {
                id: orderId,
                total: total_amount,
                status: 'received',
                items_count: items.length
            }
        });
    } catch (err) {
        await connection.rollback();
        console.error('Order error:', err);
        res.status(500).json({ error: 'Failed to place order' });
    } finally {
        connection.release();
    }
});

// GET /api/orders - Get user's orders
router.get('/', async (req, res) => {
    try {
        let query, params;

        if (req.session?.userId) {
            query = `SELECT o.*, 
                     (SELECT JSON_ARRAYAGG(JSON_OBJECT('item_name', oi.item_name, 'item_price', oi.item_price, 'quantity', oi.quantity))
                      FROM order_items oi WHERE oi.order_id = o.id) as items
                     FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`;
            params = [req.session.userId];
        } else if (req.query.email) {
            query = `SELECT o.*, 
                     (SELECT JSON_ARRAYAGG(JSON_OBJECT('item_name', oi.item_name, 'item_price', oi.item_price, 'quantity', oi.quantity))
                      FROM order_items oi WHERE oi.order_id = o.id) as items
                     FROM orders o WHERE o.customer_email = ? ORDER BY o.created_at DESC`;
            params = [req.query.email];
        } else {
            return res.status(400).json({ error: 'Login or provide email to view orders' });
        }

        const [orders] = await pool.execute(query, params);

        // Parse JSON items
        orders.forEach(order => {
            if (typeof order.items === 'string') {
                order.items = JSON.parse(order.items);
            }
        });

        res.json({ orders });
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', async (req, res) => {
    try {
        const [orders] = await pool.execute(
            `SELECT o.* FROM orders o WHERE o.id = ?`,
            [req.params.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const [items] = await pool.execute(
            'SELECT * FROM order_items WHERE order_id = ?',
            [req.params.id]
        );

        res.json({ order: { ...orders[0], items } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['received', 'grinding', 'brewing', 'arting', 'ready', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        res.json({ message: `Order status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router;
