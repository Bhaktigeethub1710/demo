// NyayaSetu Backend Server
// Entry point for the backend API

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorHandler');
const localStorageService = require('./src/services/localStorageService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Local Storage Service
localStorageService.initialize()
    .then(() => console.log('✅ Local Storage Service ready'))
    .catch(err => console.error('❌ Local Storage initialization failed:', err.message));

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'NyayaSetu Backend Server is running',
        timestamp: new Date().toISOString(),
        database: 'Connected'
    });
});

// Welcome route
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to NyayaSetu API',
        version: '1.0.0',
        endpoints: [
            '/api/health',
            '/api/auth/register',
            '/api/auth/login',
            '/api/auth/profile',
            '/api/documents/upload',
            '/api/documents/grievance/:grievanceId',
            '/api/grievances/create',
            '/api/grievances/my-grievances',
            '/api/cases (coming soon)',
            '/api/officers (coming soon)'
        ]
    });
});

// Mount routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/documents', require('./src/routes/documentRoutes'));
app.use('/api/grievances', require('./src/routes/grievanceRoutes'));
app.use('/api/tickets', require('./src/routes/grievanceTicketRoutes'));
app.use('/api/intercaste', require('./src/routes/intercasteRoutes'));


// TODO: Import and use additional routes
// app.use('/api/cases', require('./src/routes/cases'));
// app.use('/api/officers', require('./src/routes/officers'));

// Global error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 NyayaSetu Backend Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

module.exports = app;
