/**
 * ResponseDispatcher class for handling HTTP responses
 */
module.exports = class ResponseDispatcher {
    constructor() {
        this.key = "responseDispatcher";
        
        // Define standard HTTP status codes
        this.STATUS_CODES = {
            OK: 200,
            CREATED: 201,
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            FORBIDDEN: 403,
            NOT_FOUND: 404,
            INTERNAL_SERVER_ERROR: 500
        };
    }

    /**
     * Dispatches an HTTP response with standardized format
     * @param {Object} res - Express response object
     * @param {Object} options - Response options
     * @param {boolean} [options.ok=false] - Success status
     * @param {Object} [options.data={}] - Response data
     * @param {number} [options.code] - HTTP status code
     * @param {Array} [options.errors=[]] - Array of errors
     * @param {string} [options.message] - Response message
     * @param {string} [options.msg] - Alternative message (deprecated)
     * @returns {Object} Express response
     * @throws {Error} If response object is invalid
     */
    dispatch(res, { 
        ok = false, 
        data = {}, 
        code, 
        errors = [], 
        message, 
        msg 
    } = {}) {
        try {
            // Validate response object
            this._validateResponseObject(res);

            // Validate and sanitize inputs
            const sanitizedData = this._sanitizeData(data);
            const sanitizedErrors = this._sanitizeErrors(errors);
            const finalMessage = this._sanitizeMessage(message || msg);

            // Determine appropriate status code
            const statusCode = this._determineStatusCode(code, ok);

            // Construct response object
            const responseObject = {
                ok: Boolean(ok),
                data: sanitizedData,
                errors: sanitizedErrors,
                message: finalMessage,
                timestamp: new Date().toISOString()
            };

            // Send response
            return res.status(statusCode).json(responseObject);
        } catch (error) {
            console.error('Response dispatch error:', error);
            
            // Fallback error response
            return res.status(this.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                ok: false,
                data: {},
                errors: [{
                    code: 'DISPATCH_ERROR',
                    message: 'Failed to dispatch response'
                }],
                message: 'Internal Server Error',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Validates the response object
     * @private
     * @param {Object} res - Express response object
     * @throws {Error} If response object is invalid
     */
    _validateResponseObject(res) {
        if (!res || typeof res.status !== 'function' || typeof res.json !== 'function') {
            throw new Error('Invalid response object');
        }
    }

    /**
     * Determines the appropriate HTTP status code
     * @private
     * @param {number} code - Provided status code
     * @param {boolean} ok - Success status
     * @returns {number} HTTP status code
     */
    _determineStatusCode(code, ok) {
        if (Number.isInteger(code) && code >= 100 && code <= 599) {
            return code;
        }

        return ok ? this.STATUS_CODES.OK : this.STATUS_CODES.BAD_REQUEST;
    }

    /**
     * Sanitizes the response data
     * @private
     * @param {*} data - Data to sanitize
     * @returns {Object} Sanitized data
     */
    _sanitizeData(data) {
        if (data === null || data === undefined) {
            return {};
        }

        try {
            // Attempt to create a clean copy of the data
            return JSON.parse(JSON.stringify(data));
        } catch (error) {
            console.warn('Data sanitization failed:', error);
            return {};
        }
    }

    /**
     * Sanitizes the errors array
     * @private
     * @param {Array} errors - Errors to sanitize
     * @returns {Array} Sanitized errors
     */
    _sanitizeErrors(errors) {
        if (!Array.isArray(errors)) {
            return [];
        }

        return errors.map(error => {
            if (typeof error === 'string') {
                return {
                    code: 'GENERAL_ERROR',
                    message: error
                };
            }
            
            if (typeof error === 'object' && error !== null) {
                return {
                    code: error.code || 'GENERAL_ERROR',
                    message: error.message || 'Unknown error'
                };
            }

            return {
                code: 'GENERAL_ERROR',
                message: 'Unknown error'
            };
        });
    }

    /**
     * Sanitizes the response message
     * @private
     * @param {string} message - Message to sanitize
     * @returns {string} Sanitized message
     */
    _sanitizeMessage(message) {
        if (!message) {
            return '';
        }

        return String(message).slice(0, 500); // Limit message length
    }

    /**
     * Success response helper
     * @param {Object} res - Express response object
     * @param {Object} options - Response options
     */
    success(res, options = {}) {
        return this.dispatch(res, {
            ok: true,
            code: this.STATUS_CODES.OK,
            ...options
        });
    }

    /**
     * Error response helper
     * @param {Object} res - Express response object
     * @param {Object} options - Response options
     */
    error(res, options = {}) {
        return this.dispatch(res, {
            ok: false,
            code: this.STATUS_CODES.BAD_REQUEST,
            ...options
        });
    }
};
// Success response
responseDispatcher.success(res, {
    data: { user: userData },
    message: 'User created successfully'
});

// Error response
responseDispatcher.error(res, {
    errors: [{ code: 'VALIDATION_ERROR', message: 'Invalid input' }],
    message: 'Failed to create user'
});

// Custom response
responseDispatcher.dispatch(res, {
    ok: true,
    data: { items: [] },
    code: 201,
    message: 'Items created'
});
