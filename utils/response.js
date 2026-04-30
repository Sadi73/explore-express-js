const sendSuccess = (res, data = null, message = "Success", status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

const sendError = (res, message = "Something went wrong", status = 500, error = null) => {
    return res.status(status).json({
        success: false,
        message,
        error
    });
};

module.exports = { sendSuccess, sendError };