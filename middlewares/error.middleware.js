const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || null;

    // Mongoose validation error (e.g., missing required fields)
    if (err.name === "ValidationError" && err.errors) {
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors).map((el) => el.message);
    }
    // Mongoose duplicate key error (e.g., unique email already exists)
    else if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || "Field";
        message = `${field} already exists`;
    }
    // Mongoose CastError (e.g., invalid ObjectId format)
    else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid format for ${err.path}: ${err.value}`;
    }
    // Malformed JSON payload
    else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        statusCode = 400;
        message = "Malformed JSON in request body";
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        // Only attach the stack trace during development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        errors,
    });
};

module.exports = errorMiddleware;
