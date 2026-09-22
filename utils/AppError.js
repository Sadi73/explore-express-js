class AppError extends Error {
    constructor(message = "Something went wrong!", statusCode = 500, errors = null) {
        super(message);

        this.statusCode = statusCode;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;