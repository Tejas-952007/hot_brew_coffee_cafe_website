// ===================================
// BREW HAVEN CAFÉ - EXPRESS SERVER
// Main Application Entry Point
// ===================================

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const { pool, initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const reservationRoutes = require('./routes/reservations');
const menuRoutes = require('./routes/menu');
const newsletterRoutes = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// MIDDLEWARE
// ===================================

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: true,
    credentials: true
}));

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'brewhaven_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, '.')));

// ===================================
// API ROUTES
// ===================================
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1');
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: new Date().toISOString() 
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: err.message 
        });
    }
});

// Dashboard / Admin stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [orders] = await pool.execute('SELECT COUNT(*) as count FROM orders');
        const [reservations] = await pool.execute('SELECT COUNT(*) as count FROM reservations');
        const [revenue] = await pool.execute('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != "cancelled"');
        const [subscribers] = await pool.execute('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = TRUE');
        
        res.json({
            users: users[0].count,
            orders: orders[0].count,
            reservations: reservations[0].count,
            revenue: parseFloat(revenue[0].total),
            subscribers: subscribers[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve index.html for root and all non-API routes
app.get('/{path}', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// ===================================
// ERROR HANDLER
// ===================================
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ===================================
// START SERVER
// ===================================
async function startServer() {
    try {
        // Initialize database schema
        await initDatabase();
        console.log('☕ Database ready');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n☕ ═══════════════════════════════════════`);
            console.log(`☕  Brew Haven Café Server Running`);
            console.log(`☕  http://localhost:${PORT}`);
            console.log(`☕  API: http://localhost:${PORT}/api`);
            console.log(`☕ ═══════════════════════════════════════\n`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        console.error('\n💡 Make sure MySQL is running and .env credentials are correct.');
        console.error('   Edit .env file with your MySQL username and password.\n');
        process.exit(1);
    }
}

startServer();
