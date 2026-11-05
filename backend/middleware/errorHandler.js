/**
 * ============================================================================
 * SpendWise - Global Error Handler Middleware
 * ============================================================================
 * This middleware catches any unhandled errors thrown by route handlers or
 * controllers and returns a clean, structured JSON response with an appropriate
 * HTTP status code.
 *
 * Beginner-friendly and easy to explain during a project viva.
 * ============================================================================
 */

function errorHandler(err, req, res, next) {
  console.error('[Error Details]:', err.message || err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific Prisma database errors if using real Prisma Client
  if (err.code === 'P2002') {
    // Unique constraint violation (e.g., duplicate category name)
    statusCode = 400;
    message = 'A record with this unique value already exists.';
  } else if (err.code === 'P2025') {
    // Record not found in database
    statusCode = 404;
    message = 'The requested record was not found.';
  } else if (err.type === 'entity.parse.failed') {
    // Malformed JSON in request body
    statusCode = 400;
    message = 'Invalid JSON in request payload.';
  }

  // Return standard JSON error structure to the client
  res.status(statusCode).json({
    success: false,
    error: message
  });
}

module.exports = errorHandler;

