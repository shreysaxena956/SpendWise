/**
 * ============================================================================
 * SpendWise - Vercel Serverless API Handler
 * ============================================================================
 * Entry point for Vercel Serverless Functions.
 * Routes all incoming requests under /api/* to the Express application.
 * ============================================================================
 */

const app = require('../backend/server');

module.exports = app;
