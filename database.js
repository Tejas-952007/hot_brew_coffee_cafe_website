// ===================================
// BREW HAVEN CAFÉ - DATABASE MODULE
// MySQL Connection & Schema Setup
// ===================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'brewhaven_cafe',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database and tables
async function initDatabase() {
    // First connect without specifying a database to create it if needed
    const tempConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
    });

    const dbName = process.env.DB_NAME || 'brewhaven_cafe';

    // Create database if not exists
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConnection.query(`USE \`${dbName}\``);

    // ===================================
    // USERS TABLE
    // ===================================
    await tempConnection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) DEFAULT NULL,
            address TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // ===================================
    // MENU ITEMS TABLE
    // ===================================
    await tempConnection.query(`
        CREATE TABLE IF NOT EXISTS menu_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            category ENUM('coffee','cold-coffee','pizza','sandwich','desserts','custom') DEFAULT 'coffee',
            image_url VARCHAR(500),
            rating DECIMAL(2,1) DEFAULT 0.0,
            badge VARCHAR(50) DEFAULT NULL,
            is_available BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ===================================
    // ORDERS TABLE
    // ===================================
    await tempConnection.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT DEFAULT NULL,
            customer_name VARCHAR(100) NOT NULL,
            customer_email VARCHAR(150) NOT NULL,
            customer_phone VARCHAR(20) NOT NULL,
            delivery_address TEXT NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            status ENUM('received','grinding','brewing','arting','ready','delivered','cancelled') DEFAULT 'received',
            order_type ENUM('dine-in','takeaway','delivery') DEFAULT 'delivery',
            notes TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    // ===================================
    // ORDER ITEMS TABLE
    // ===================================
    await tempConnection.query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            item_name VARCHAR(200) NOT NULL,
            item_price DECIMAL(10,2) NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            special_instructions TEXT DEFAULT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    `);

    // ===================================
    // RESERVATIONS TABLE
    // ===================================
    await tempConnection.query(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT DEFAULT NULL,
            customer_name VARCHAR(100) NOT NULL,
            customer_phone VARCHAR(20) NOT NULL,
            reservation_date DATE NOT NULL,
            reservation_time TIME NOT NULL,
            guests INT NOT NULL,
            status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
            special_requests TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    // ===================================
    // NEWSLETTER SUBSCRIBERS TABLE
    // ===================================
    await tempConnection.query(`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(150) NOT NULL UNIQUE,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
        )
    `);

    // ===================================
    // CONTACT MESSAGES TABLE
    // ===================================
    await tempConnection.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL,
            subject VARCHAR(255) DEFAULT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ===================================
    // SEED DEFAULT MENU ITEMS
    // ===================================
    const [rows] = await tempConnection.query('SELECT COUNT(*) as count FROM menu_items');
    if (rows[0].count === 0) {
        const menuItems = [
            ['Classic Espresso', 'Rich, bold, and perfectly extracted', 4.99, 'coffee', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', 5.0, 'Popular'],
            ['Creamy Cappuccino', 'Perfect balance of espresso and steamed milk', 5.49, 'coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 4.8, null],
            ['Vanilla Latte', 'Smooth espresso with vanilla and milk', 5.99, 'coffee', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400', 4.9, null],
            ['Iced Caramel Macchiato', 'Chilled espresso with caramel drizzle', 6.49, 'cold-coffee', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400', 5.0, 'New'],
            ['Cold Brew Classic', 'Slow-steeped for 20 hours', 5.99, 'cold-coffee', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', 4.7, null],
            ['Margherita Pizza', 'Fresh mozzarella, tomatoes, basil', 12.99, 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 4.9, 'Best Seller'],
            ['Pepperoni Pizza', 'Classic pepperoni with extra cheese', 14.99, 'pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', 4.8, null],
            ['Club Sandwich', 'Chicken, bacon, lettuce, tomato', 9.99, 'sandwich', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', 4.9, null],
            ['Grilled Cheese Deluxe', 'Triple cheese blend on sourdough', 8.99, 'sandwich', 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=400', 4.7, null],
            ['Chocolate Lava Cake', 'Warm, gooey chocolate perfection', 7.99, 'desserts', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 5.0, "Chef's Special"],
            ['Butter Croissant', 'Flaky, buttery, freshly baked', 4.49, 'desserts', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', 4.8, null],
            ['New York Cheesecake', 'Creamy, rich, classic recipe', 6.99, 'desserts', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', 4.9, null]
        ];

        for (const item of menuItems) {
            await tempConnection.query(
                'INSERT INTO menu_items (name, description, price, category, image_url, rating, badge) VALUES (?, ?, ?, ?, ?, ?, ?)',
                item
            );
        }
        console.log('✅ Menu items seeded successfully');
    }

    await tempConnection.end();
    console.log('✅ Database schema initialized');
}

module.exports = { pool, initDatabase };
