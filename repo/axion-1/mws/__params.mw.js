/**
 * Parameters middleware for processing request parameters
 * @param {Object} params - Middleware configuration
 * @param {Object} params.meta - Metadata configuration
 * @param {Object} params.config - Configuration options
 * @param {Object} params.managers - Manager instances
 */
module.exports = ({ meta, config, managers }) => {
    /**
     * Process and validate request parameters
     * @param {Object} params - Request parameters
     * @param {Object} params.req - Express request object
     * @param {Object} params.res - Express response object
     * @param {Function} params.next - Next middleware function
     */
    return ({ req, res, next }) => {
        try {
            // Validate request object
            if (!req) {
                throw new Error('Request object is missing');
            }

            // Initialize params response object
            const paramsResponse = {
                success: true,
                timestamp: new Date().toISOString(),
                params: {},
                query: {},
                metadata: {
                    paramCount: 0,
                    queryCount: 0,
                    path: req.path || req.url || 'unknown',
                    method: req.method || 'unknown'
                }
            };

            // Process URL parameters
            if (req.params) {
                paramsResponse.params = sanitizeParams(req.params);
                paramsResponse.metadata.paramCount = Object.keys(paramsResponse.params).length;
            }

            // Process query parameters
            if (req.query) {
                paramsResponse.query = sanitizeParams(req.query);
                paramsResponse.metadata.queryCount = Object.keys(paramsResponse.query).length;
            }

            // Add validation status
            paramsResponse.validation = validateParameters(paramsResponse.params, paramsResponse.query);

            // Store processed parameters in request for later use
            req.processedParams = paramsResponse;

            return next(paramsResponse);

        } catch (error) {
            console.error('Parameters middleware error:', error);
            return next({
                success: false,
                error: error.message || 'Error processing parameters',
                timestamp: new Date().toISOString()
            });
        }
    };
};

/**
 * Sanitize parameters
 * @param {Object} params - Parameters to sanitize
 * @returns {Object} Sanitized parameters
 */
function sanitizeParams(params) {
    const sanitized = {};

    try {
        Object.entries(params).forEach(([key, value]) => {
            // Convert parameter keys to lowercase
            const sanitizedKey = key.toLowerCase();

            // Handle different value types
            let sanitizedValue = value;
            if (Array.isArray(value)) {
                sanitizedValue = value.map(item => sanitizeValue(item));
            } else {
                sanitizedValue = sanitizeValue(value);
            }

            // Only add non-empty values
            if (sanitizedValue !== null && sanitizedValue !== undefined) {
                sanitized[sanitizedKey] = sanitizedValue;
            }
        });
    } catch (error) {
        console.error('Error sanitizing parameters:', error);
    }

    return sanitized;
}

/**
 * Sanitize individual parameter value
 * @param {any} value - Value to sanitize
 * @returns {any} Sanitized value
 */
function sanitizeValue(value) {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'string') {
        // Trim and sanitize string values
        const trimmed = value.trim();
        // Return null for empty strings
        return trimmed === '' ? null : trimmed;
    }

    if (typeof value === 'number') {
        // Handle NaN values
        return isNaN(value) ? null : value;
    }

    return value;
}

/**
 * Validate parameters
 * @param {Object} params - URL parameters
 * @param {Object} query - Query parameters
 * @returns {Object} Validation results
 */
function validateParameters(params, query) {
    return {
        hasParams: Object.keys(params).length > 0,
        hasQuery: Object.keys(query).length > 0,
        isValid: true, // Can be extended with specific validation rules
        timestamp: new Date().toISOString()
    };
}

/**
 * Example usage:
 * const paramsMiddleware = require('./__params.mw.js');
 * app.use(paramsMiddleware({ meta: {}, config: {}, managers: {} }));
 * 
 * Example response:
 * {
 *   success: true,
 *   timestamp: "2024-01-17T12:34:56.789Z",
 *   params: {
 *     id: "123",
 *     type: "user"
 *   },
 *   query: {
 *     sort: "desc",
 *     limit: "10"
 *   },
 *   metadata: {
 *     paramCount: 2,
 *     queryCount: 2,
 *     path: "/api/users/123",
 *     method: "GET"
 *   },
 *   validation: {
 *     hasParams: true,
 *     hasQuery: true,
 *     isValid: true,
 *     timestamp: "2024-01-17T12:34:56.789Z"
 *   }
 * }
 */
