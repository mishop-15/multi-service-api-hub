const express = require('express');
const {setupCORS} = require('./middleware.js');
const router = require('./routes.js');

const app = express();

// Middleware
app.use(express.json());
app.use(setupCORS);

// Routes
app.use('/', router);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});