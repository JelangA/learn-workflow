const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/product', productRoutes);
app.use('/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'URL Not Found',
        message: 'The requested URL was not found',
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
