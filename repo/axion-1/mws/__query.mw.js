/**
 * Query middleware for processing request query parameters
 * @param {Object} params - Middleware configuration
 * @param {Object} params.meta - Metadata configuration
 * @param {Object} params.config - Configuration options
 * @param {Object} params.managers - Manager instances
 */
module.exports = ({ meta, config, managers }) => {
    /**
     * Process and validate query parameters
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

            // Initialize query response object
            const queryResponse = {
                success: true,
                timestamp: new Date().toISOString(),
                originalQuery: {},
                processedQuery: {},
                metadata: {
                    count: 0,
                    path: req.path || req.url || 'unknown',
                    method: req.method || 'unknown'
                }
            };

            // Process query parameters if they exist
            if (req.query) {
                // Store original query
                queryResponse.originalQuery = { ...req.query };
                
                // Process and sanitize query parameters
                const sanitizedQuery = sanitizeQueryParams(req.query);
                queryResponse.processedQuery = sanitizedQuery;
                queryResponse.metadata.count = Object.keys(sanitizedQuery).length;

                // Add validation results
                queryResponse.validation = validateQueryParams(sanitizedQuery);
            }

            // Store processed query in request for later use
            req.processedQuery = queryResponse;

            return next(queryResponse);

        } catch (error) {
            console.error('Query middleware error:', error);
            return next({
                success: false,
                error: error.message || 'Error processing query parameters',
                timestamp: new Date().toISOString()
            });
        }
    };
};

/**
 * Sanitize query parameters
 * @param {Object} query - Query parameters to sanitize
 * @returns {Object} Sanitized query parameters
 */
function sanitizeQueryParams(query) {
    const sanitized = {};

    try {
        Object.entries(query).forEach(([key, value]) => {
            // Convert parameter keys to lowercase
            const sanitizedKey = key.toLowerCase();

            // Process the value
            const sanitizedValue = processQueryValue(value);

            // Only add non-null values
            if (sanitizedValue !== null) {
                sanitized[sanitizedKey] = sanitizedValue;
            }
        });
    } catch (error) {
        console.error('Error sanitizing query parameters:', error);
    }

    return sanitized;
}

/**
 * Process query parameter value
 * @param {any} value - Value to process
 * @returns {any} Processed value
 */
function processQueryValue(value) {
    if (value === null || value === undefined) {
        return null;
    }

    if (Array.isArray(value)) {
        // Process array values
        const processed = value
            .map(item => processQueryValue(item))
            .filter(item => item !== null);
        return processed.length > 0 ? processed : null;
    }

    if (typeof value === 'string') {
        // Trim and process string values
        const trimmed = value.trim();
        if (trimmed === '') return null;

        // Try to convert numeric strings to numbers
        if (/^\d+$/.test(trimmed)) {
            return parseInt(trimmed, 10);
        }
        if (/^\d*\.\d+$/.test(trimmed)) {
            return parseFloat(trimmed);
        }

        // Handle boolean strings
        if (trimmed.toLowerCase() === 'true') return true;
        if (trimmed.toLowerCase() === 'false') return false;

        return trimmed;
    }

    return value;
}

/**
 * Validate query parameters
 * @param {Object} query - Query parameters to validate
 * @returns {Object} Validation results
 */
function validateQueryParams(query) {
    return {
        hasQuery: Object.keys(query).length > 0,
        isValid: true,
        timestamp: new Date().toISOString(),
        paramTypes: getParameterTypes(query)
    };
}

/**
 * Get parameter types from query object
 * @param {Object} query - Query parameters
 * @returns {Object} Parameter types
 */
function getParameterTypes(query) {
    const types = {};
    Object.entries(query).forEach(([key, value]) => {
        types[key] = Array.isArray(value) ? 'array' : typeof value;
    });
    return types;
}

/**
 * Example usage:
 * const queryMiddleware = require('./__query.mw.js');
 * app.use(queryMiddleware({ meta: {}, config: {}, managers: {} }));
 * 
 * Example response:
 * {
 *   success: true,
 *   timestamp: "2024-01-17T12:34:56.789Z",
 *   originalQuery: {
 *     limit: "10",
 *     page: "1",
 *     sort: "desc"
 *   },
 *   processedQuery: {
 *     limit: 10,
 *     page: 1,
 *     sort: "desc"
 *   },
 *   metadata: {
 *     count: 3,
 *     path: "/api/users",
 *     method: "GET"
 *   },
 *   validation: {
 *     hasQuery: true,
 *     isValid: true,
 *     timestamp: "2024-01-17T12:34:56.789Z",
 *     paramTypes: {
 *       limit: "number",
 *       page: "number",
 *       sort: "string"
 *     }
 *   }
 * }
 */
