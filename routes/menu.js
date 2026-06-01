// ===================================
// MENU ROUTES
// ===================================

const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// GET /api/menu - Get all menu items
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const search = req.query.search;

        let query = 'SELECT * FROM menu_items WHERE is_available = TRUE';
        let params = [];

        if (category && category !== 'all') {
            query += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY category, name';

        const [items] = await pool.execute(query, params);
        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// GET /api/menu/:id - Get single menu item
router.get('/:id', async (req, res) => {
    try {
        const [items] = await pool.execute('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
        if (items.length === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json({ item: items[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch menu item' });
    }
});

module.exports = router;
