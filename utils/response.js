const sendSuccess = (
    res,
    data = null,
    message = "Success",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        data
    });
};

module.exports = sendSuccess;