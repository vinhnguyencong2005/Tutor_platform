const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./api');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the view and assets directories
app.use(express.static(path.join(__dirname, '../view')));
app.use(express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../js')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public')));

// Root route - redirect to home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../view/home.html'));
});

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
