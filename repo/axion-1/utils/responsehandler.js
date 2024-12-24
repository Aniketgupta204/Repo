// utils/responseHandler.js
class ResponseHandler {
    static success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static error(res, message = 'Error occurred', statusCode = 500, errors = []) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors
        });
    }
}

module.exports = ResponseHandler;
