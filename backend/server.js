/**
 * ============================================================================
 * SpendWise - Express Server
 * ============================================================================
 * Main entry point for the SpendWise backend application.
 *
 * This server exposes RESTful APIs for:
 *  - Transactions (/api/transactions)
 *  - Dashboard metrics (/api/dashboard)
 *  - Category management (/api/categories)
 *  - Monthly & category reports (/api/reports)
 *
 * Designed for offline-first, single-user desktop personal finance management.
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Import route modules
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Import global error handling middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize the Express application
const app = express();

// Set the port (defaults to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

// ============================================================================
// Global Middleware Setup
// ============================================================================

// 1. Enable CORS so the React frontend can communicate with this backend
app.use(cors());

// 2. Parse incoming JSON request bodies
app.use(express.json());

// 3. Simple request logger for development and viva demonstration
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================================================
// API Routes
// ============================================================================

// Base welcome route for API health check
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'SpendWise API',
    description: 'Offline-first Personal Finance Backend',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      transactions: '/api/transactions',
      dashboard: '/api/dashboard',
      categories: '/api/categories',
      monthlyReport: '/api/reports/monthly',
      categoryWiseReport: '/api/reports/category-wise'
    }
  });
});

// Mount modular API routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);

// ============================================================================
// Error Handling Middleware
// ============================================================================

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

// ============================================================================
// Start Server
// ============================================================================

// Only start standalone HTTP server when executed directly (node server.js)
// and not in test or Vercel serverless function environments.
if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(` SpendWise Backend Server is running!`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Mode: ${process.env.USE_MOCK === 'true' ? 'Temporary Mock Data' : 'PostgreSQL Database'}`);
    console.log('====================================================');
  });
}

module.exports = app;

