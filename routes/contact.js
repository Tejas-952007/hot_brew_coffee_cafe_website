// ===================================
// CONTACT MESSAGE ROUTES
// ===================================

const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// POST /api/contact - Submit a contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        await pool.execute(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject || null, message]
        );

        res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });
    } catch (err) {
        console.error('Contact error:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// GET /api/contact - Get all messages (admin)
router.get('/', async (req, res) => {
    try {
        const [messages] = await pool.execute(
            'SELECT * FROM contact_messages ORDER BY created_at DESC'
        );
        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;
