// ===================================
// RESERVATION ROUTES
// ===================================

const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// POST /api/reservations - Create a new reservation
router.post('/', async (req, res) => {
    try {
        const { customer_name, customer_phone, reservation_date, reservation_time, guests, special_requests } = req.body;

        if (!customer_name || !customer_phone || !reservation_date || !reservation_time || !guests) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate date is not in the past
        const resDate = new Date(reservation_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (resDate < today) {
            return res.status(400).json({ error: 'Reservation date cannot be in the past' });
        }

        const [result] = await pool.execute(
            `INSERT INTO reservations (user_id, customer_name, customer_phone, reservation_date, reservation_time, guests, special_requests)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.session?.userId || null, customer_name, customer_phone, reservation_date, reservation_time, guests, special_requests || null]
        );

        res.status(201).json({
            message: 'Reservation confirmed! See you soon!',
            reservation: {
                id: result.insertId,
                date: reservation_date,
                time: reservation_time,
                guests,
                status: 'pending'
            }
        });
    } catch (err) {
        console.error('Reservation error:', err);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// GET /api/reservations - Get user's reservations
router.get('/', async (req, res) => {
    try {
        let query, params;

        if (req.session?.userId) {
            query = 'SELECT * FROM reservations WHERE user_id = ? ORDER BY reservation_date DESC';
            params = [req.session.userId];
        } else if (req.query.phone) {
            query = 'SELECT * FROM reservations WHERE customer_phone = ? ORDER BY reservation_date DESC';
            params = [req.query.phone];
        } else {
            return res.status(400).json({ error: 'Login or provide phone to view reservations' });
        }

        const [reservations] = await pool.execute(query, params);
        res.json({ reservations });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// PUT /api/reservations/:id/cancel - Cancel a reservation
router.put('/:id/cancel', async (req, res) => {
    try {
        await pool.execute(
            'UPDATE reservations SET status = "cancelled" WHERE id = ?',
            [req.params.id]
        );
        res.json({ message: 'Reservation cancelled' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to cancel reservation' });
    }
});

module.exports = router;
