// ===================================
// NEWSLETTER ROUTES
// ===================================

const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if already subscribed
        const [existing] = await pool.execute(
            'SELECT id, is_active FROM newsletter_subscribers WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            if (existing[0].is_active) {
                return res.json({ message: 'You are already subscribed!' });
            } else {
                // Reactivate
                await pool.execute(
                    'UPDATE newsletter_subscribers SET is_active = TRUE WHERE email = ?',
                    [email]
                );
                return res.json({ message: 'Welcome back! Subscription reactivated.' });
            }
        }

        await pool.execute(
            'INSERT INTO newsletter_subscribers (email) VALUES (?)',
            [email]
        );

        res.status(201).json({ message: 'Thank you for subscribing!' });
    } catch (err) {
        console.error('Newsletter error:', err);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// POST /api/newsletter/unsubscribe
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;
        await pool.execute(
            'UPDATE newsletter_subscribers SET is_active = FALSE WHERE email = ?',
            [email]
        );
        res.json({ message: 'You have been unsubscribed.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

module.exports = router;
