const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;

    const message =
        err.message || "Internal Server Error";

    const errors = err.errors || null;

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