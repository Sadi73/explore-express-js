const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    // Log the full error for debugging and observability
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errorDetails = null;

    // 1. Mongoose Validation Error (e.g., missing required fields)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errorDetails = Object.values(err.errors).map((el) => el.message);
    }

    // 2. Mongoose Duplicate Key Error (e.g., unique email already exists)
    else if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'Field';
        message = `${field} already exists`;
    }

    // 3. Mongoose CastError (e.g., invalid MongoDB ObjectId format)
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid format for ${err.path}: ${err.value}`;
    }

    // 4. Express JSON parse syntax error (e.g., malformed JSON payload)
    else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Malformed JSON in request body';
    }

    // In production, avoid exposing unexpected internal 500 error details
    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
        message = 'Internal Server Error';
    }

    return sendError(res, message, statusCode, errorDetails);
};

module.exports = errorHandler;
